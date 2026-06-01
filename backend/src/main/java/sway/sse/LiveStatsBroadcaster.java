package sway.sse;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import sway.entity.ServerUtility;
import sway.repository.ServerUtilityRepository;
import sway.repository.SwayDataRepository;

import java.io.IOException;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Component
public class LiveStatsBroadcaster {

    private static final Logger log = LoggerFactory.getLogger(LiveStatsBroadcaster.class);

    private final Set<SseEmitter> emitters = ConcurrentHashMap.newKeySet();
    private final ObjectMapper mapper = new ObjectMapper().findAndRegisterModules();
    private final ScheduledExecutorService heartbeatExec = Executors.newSingleThreadScheduledExecutor(r -> {
        Thread t = new Thread(r, "sse-heartbeat");
        t.setDaemon(true);
        return t;
    });

    private final ServerUtilityRepository serverUtilityRepository;
    private final SwayDataRepository swayDataRepository;

    @Value("${sway.sse.emitter-timeout-ms}")
    private long emitterTimeoutMs;

    @Value("${sway.sse.heartbeat-interval-ms}")
    private long heartbeatIntervalMs;

    private volatile String lastServersHash = "";
    private volatile long lastPlayersCount = -1L;

    public LiveStatsBroadcaster(ServerUtilityRepository serverUtilityRepository,
                                SwayDataRepository swayDataRepository) {
        this.serverUtilityRepository = serverUtilityRepository;
        this.swayDataRepository = swayDataRepository;
    }

    @PostConstruct
    void startHeartbeat() {
        heartbeatExec.scheduleAtFixedRate(this::sendHeartbeat,
                heartbeatIntervalMs, heartbeatIntervalMs, TimeUnit.MILLISECONDS);
    }

    @PreDestroy
    void shutdown() {
        heartbeatExec.shutdownNow();
        for (SseEmitter e : emitters) {
            try { e.complete(); } catch (Exception ignored) {}
        }
        emitters.clear();
    }

    public SseEmitter register() {
        SseEmitter emitter = new SseEmitter(emitterTimeoutMs);
        emitters.add(emitter);
        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> { emitters.remove(emitter); emitter.complete(); });
        emitter.onError(t -> emitters.remove(emitter));

        // Send current snapshot immediately so client renders without waiting next poll.
        try {
            List<ServerUtility> servers = serverUtilityRepository.findAll();
            long count = swayDataRepository.count();
            emitter.send(SseEmitter.event().name("servers").data(mapper.writeValueAsString(servers)));
            emitter.send(SseEmitter.event().name("count").data(Long.toString(count)));
        } catch (Exception ignored) {
            // First-snapshot failure shouldn't kill the connection; next tick retries.
        }
        return emitter;
    }

    @Scheduled(fixedDelayString = "${sway.sse.poll-interval-ms}")
    public void pollAndBroadcast() {
        if (emitters.isEmpty()) return;
        try {
            List<ServerUtility> servers = serverUtilityRepository.findAll();
            String hash = hashServers(servers);
            if (!hash.equals(lastServersHash)) {
                lastServersHash = hash;
                broadcast("servers", mapper.writeValueAsString(servers));
            }
        } catch (Exception e) {
            log.debug("SSE servers poll failed", e);
        }
        try {
            long count = swayDataRepository.count();
            if (count != lastPlayersCount) {
                lastPlayersCount = count;
                broadcast("count", Long.toString(count));
            }
        } catch (Exception e) {
            log.debug("SSE count poll failed", e);
        }
    }

    private void sendHeartbeat() {
        if (emitters.isEmpty()) return;
        broadcast("ping", String.valueOf(System.currentTimeMillis()));
    }

    private void broadcast(String event, String data) {
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event().name(event).data(data));
            } catch (IOException | IllegalStateException ex) {
                emitters.remove(emitter);
                try { emitter.complete(); } catch (Exception ignored) {}
            }
        }
    }

    private String hashServers(List<ServerUtility> servers) throws JsonProcessingException {
        // Cheap "diff" via JSON serialize. Servers list is small (3 rows).
        return Integer.toHexString(mapper.writeValueAsString(servers).hashCode());
    }
}
