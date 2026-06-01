package sway.config;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.jsontype.BasicPolymorphicTypeValidator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.Cache;
import org.springframework.cache.annotation.CachingConfigurer;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.interceptor.CacheErrorHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

/**
 * Implements {@link CachingConfigurer} so the custom {@link CacheErrorHandler}
 * is actually registered. A bare @Bean CacheErrorHandler is ignored by Spring,
 * which is why Redis outages / serialization errors previously surfaced as 500s.
 * With this in place the cache fails open: requests fall back to the DB.
 */
@Configuration
@EnableCaching
public class CacheConfig implements CachingConfigurer {

    private static final Logger log = LoggerFactory.getLogger(CacheConfig.class);

    public static final String CACHE_PLAYERS_ALL = "players-all";
    public static final String CACHE_PLAYERS_PAGE = "players-page";
    public static final String CACHE_PLAYERS_COUNT = "players-count";
    public static final String CACHE_PLAYERS_POTW = "players-potw";
    public static final String CACHE_PLAYER_PROFILE = "player-profile";
    public static final String CACHE_PLAYER_RANK = "player-rank";
    public static final String CACHE_CHEATERS = "cheaters";
    public static final String CACHE_JUMPS_PRE = "jumps-pre";
    public static final String CACHE_JUMPS_NOPRE = "jumps-nopre";
    public static final String CACHE_SERVERS = "servers";

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        ObjectMapper mapper = new ObjectMapper();
        mapper.findAndRegisterModules();
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        // Derived getters (e.g. getSteamId) emit JSON props with no matching setter;
        // empty transient beans may also appear. Tolerate both so cache round-trips.
        mapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
        mapper.disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);
        BasicPolymorphicTypeValidator ptv = BasicPolymorphicTypeValidator.builder()
                .allowIfSubType(Object.class)
                .build();
        mapper.activateDefaultTyping(ptv, ObjectMapper.DefaultTyping.NON_FINAL);

        GenericJackson2JsonRedisSerializer json = new GenericJackson2JsonRedisSerializer(mapper);

        RedisCacheConfiguration base = RedisCacheConfiguration.defaultCacheConfig()
                .disableCachingNullValues()
                .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(json))
                .prefixCacheNameWith("sway:");

        Map<String, RedisCacheConfiguration> perCache = new HashMap<>();
        perCache.put(CACHE_PLAYERS_ALL,     base.entryTtl(Duration.ofSeconds(30)));
        perCache.put(CACHE_PLAYERS_PAGE,    base.entryTtl(Duration.ofSeconds(15)));
        perCache.put(CACHE_PLAYERS_COUNT,   base.entryTtl(Duration.ofSeconds(30)));
        perCache.put(CACHE_PLAYERS_POTW,    base.entryTtl(Duration.ofMinutes(5)));
        perCache.put(CACHE_PLAYER_PROFILE,  base.entryTtl(Duration.ofSeconds(20)));
        perCache.put(CACHE_PLAYER_RANK,     base.entryTtl(Duration.ofSeconds(30)));
        perCache.put(CACHE_CHEATERS,        base.entryTtl(Duration.ofSeconds(60)));
        perCache.put(CACHE_JUMPS_PRE,       base.entryTtl(Duration.ofSeconds(60)));
        perCache.put(CACHE_JUMPS_NOPRE,     base.entryTtl(Duration.ofSeconds(60)));
        perCache.put(CACHE_SERVERS,         base.entryTtl(Duration.ofSeconds(5)));

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(base.entryTtl(Duration.ofSeconds(30)))
                .withInitialCacheConfigurations(perCache)
                .transactionAware()
                .build();
    }

    /**
     * Registered via CachingConfigurer (not as a plain bean) so it takes effect.
     * Every cache op fails open — a broken Redis never breaks a request.
     */
    @Override
    public CacheErrorHandler errorHandler() {
        return new CacheErrorHandler() {
            @Override
            public void handleCacheGetError(RuntimeException exception, Cache cache, Object key) {
                log.warn("Cache GET failed ({}), serving fresh: {}", cache.getName(), exception.getMessage());
            }
            @Override
            public void handleCachePutError(RuntimeException exception, Cache cache, Object key, Object value) {
                log.warn("Cache PUT failed ({}): {}", cache.getName(), exception.getMessage());
            }
            @Override
            public void handleCacheEvictError(RuntimeException exception, Cache cache, Object key) {
                log.warn("Cache EVICT failed ({}): {}", cache.getName(), exception.getMessage());
            }
            @Override
            public void handleCacheClearError(RuntimeException exception, Cache cache) {
                log.warn("Cache CLEAR failed ({}): {}", cache.getName(), exception.getMessage());
            }
        };
    }
}
