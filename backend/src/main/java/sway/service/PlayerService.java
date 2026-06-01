package sway.service;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import sway.config.CacheConfig;
import sway.entity.SwayData;
import sway.repository.JumpStatNoPreRepository;
import sway.repository.JumpStatPreRepository;
import sway.repository.SwayDataRepository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

/**
 * Cache lives on plain serializable return types (no ResponseEntity, no sync)
 * so that a Redis or serialization hiccup degrades gracefully via the
 * fail-open CacheErrorHandler instead of throwing a 500.
 */
@Service
public class PlayerService {

    private static final Set<String> ALLOWED_SORT_PROPERTIES = Set.of(
        "kills", "time", "mixelo", "mixgames", "mixwon", "mixdisconnects", "mixtotalstabs"
    );

    private final SwayDataRepository swayDataRepository;
    private final JumpStatPreRepository preRepo;
    private final JumpStatNoPreRepository noPreRepo;

    public PlayerService(SwayDataRepository swayDataRepository,
                         JumpStatPreRepository preRepo,
                         JumpStatNoPreRepository noPreRepo) {
        this.swayDataRepository = swayDataRepository;
        this.preRepo = preRepo;
        this.noPreRepo = noPreRepo;
    }

    @Cacheable(CacheConfig.CACHE_PLAYERS_ALL)
    public List<SwayData> getAllPlayers() {
        return swayDataRepository.findAll();
    }

    @Cacheable(CacheConfig.CACHE_PLAYERS_COUNT)
    public long countPlayers() {
        return swayDataRepository.count();
    }

    @Cacheable(value = CacheConfig.CACHE_PLAYERS_PAGE,
               key = "T(java.util.Objects).hash(#mode, #page, #size, #sortBy, #direction, #search)")
    public Map<String, Object> getPlayersPage(String mode, int page, int size,
                                              String sortBy, String direction, String search) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 100);
        Sort sort = buildSort(sortBy, direction);
        Pageable pageable = PageRequest.of(safePage, safeSize, sort);
        String safeSearch = sanitizeSearch(search);

        Page<SwayData> resultPage;
        if ("MIX".equalsIgnoreCase(mode)) {
            if (safeSearch.isEmpty()) {
                resultPage = swayDataRepository.findByMixgamesGreaterThan(0, pageable);
            } else {
                resultPage = swayDataRepository.findByNameContainingIgnoreCaseAndMixgamesGreaterThan(safeSearch, 0, pageable);
            }
        } else {
            if (safeSearch.isEmpty()) {
                resultPage = swayDataRepository.findAll(pageable);
            } else {
                resultPage = swayDataRepository.findByNameContainingIgnoreCase(safeSearch, pageable);
            }
        }

        Map<String, Object> payload = new HashMap<>();
        payload.put("content", resultPage.getContent());
        payload.put("page", resultPage.getNumber());
        payload.put("size", resultPage.getSize());
        payload.put("totalElements", resultPage.getTotalElements());
        payload.put("totalPages", resultPage.getTotalPages());
        payload.put("hasNext", resultPage.hasNext());
        payload.put("hasPrevious", resultPage.hasPrevious());
        return payload;
    }

    @Cacheable(value = CacheConfig.CACHE_PLAYERS_POTW, unless = "#result == null")
    public SwayData getPlayerOfTheWeek() {
        SwayData potw = swayDataRepository.findTopByOrderByWeektimeDesc();
        if (potw == null) return null;
        int kills = potw.getKills() != null ? potw.getKills() : 0;
        potw.setServerRank(swayDataRepository.countByKillsGreaterThan(kills) + 1);
        int mixGames = potw.getMixgames() != null ? potw.getMixgames() : 0;
        if (mixGames > 0) {
            int mixElo = potw.getMixelo() != null ? potw.getMixelo() : 0;
            potw.setMixRank(swayDataRepository.countByMixeloGreaterThan(mixElo) + 1);
        } else {
            potw.setMixRank(null);
        }
        return potw;
    }

    /** @return rank (>=1), or null when player not found, or -1 for bad id format. */
    @Cacheable(value = CacheConfig.CACHE_PLAYER_RANK, key = "#id + ':' + #mode", unless = "#result == null")
    public Integer getPlayerRank(String id, String mode) {
        Optional<SwayData> playerOpt;
        try {
            Integer numericId = Integer.parseInt(id);
            playerOpt = swayDataRepository.findBySteamid(numericId);
            if (!playerOpt.isPresent()) {
                playerOpt = swayDataRepository.findById(numericId);
            }
        } catch (NumberFormatException e) {
            return -1;
        }
        if (playerOpt.isPresent()) {
            SwayData player = playerOpt.get();
            if ("hns".equalsIgnoreCase(mode)) {
                int kills = player.getKills() != null ? player.getKills() : 0;
                return swayDataRepository.countByKillsGreaterThan(kills) + 1;
            } else if ("mix".equalsIgnoreCase(mode)) {
                int mixelo = player.getMixelo() != null ? player.getMixelo() : 0;
                return swayDataRepository.countByMixeloGreaterThan(mixelo) + 1;
            }
        }
        return null;
    }

    @Cacheable(value = CacheConfig.CACHE_PLAYER_PROFILE, key = "#id", unless = "#result == null")
    public SwayData getPlayerById(String id) {
        Integer numericId = parseNumericId(id);
        if (numericId == null) return null;

        Optional<SwayData> playerOpt = findPlayerByAnyIdFormat(numericId);
        if (!playerOpt.isPresent()) return null;

        SwayData player = playerOpt.get();
        try {
            attachJumpStats(player, numericId);
        } catch (Exception ignored) {
            // Keep profile available even when jump tables are unavailable.
        }
        int kills = player.getKills() != null ? player.getKills() : 0;
        player.setServerRank(swayDataRepository.countByKillsGreaterThan(kills) + 1);
        return player;
    }

    // --- helpers ---

    private String sanitizeSearch(String raw) {
        if (raw == null) return "";
        String trimmed = raw.trim();
        if (trimmed.length() > 64) trimmed = trimmed.substring(0, 64);
        return trimmed;
    }

    private Integer parseNumericId(String rawId) {
        if (rawId == null || rawId.trim().isEmpty()) return null;
        String cleanId = rawId;
        if (rawId.contains(":")) {
            String[] parts = rawId.split(":");
            cleanId = parts[parts.length - 1];
        }
        try {
            return Integer.parseInt(cleanId);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private Optional<SwayData> findPlayerByAnyIdFormat(Integer numericId) {
        Optional<SwayData> playerOpt = swayDataRepository.findBySteamid(numericId);
        if (playerOpt.isPresent()) return playerOpt;
        playerOpt = swayDataRepository.findById(numericId);
        if (playerOpt.isPresent()) return playerOpt;

        int normalizedSteam2Z = numericId / 2;
        if (normalizedSteam2Z > 0 && normalizedSteam2Z != numericId) {
            playerOpt = swayDataRepository.findBySteamid(normalizedSteam2Z);
            if (playerOpt.isPresent()) return playerOpt;
            return swayDataRepository.findById(normalizedSteam2Z);
        }
        return Optional.empty();
    }

    private void attachJumpStats(SwayData player, Integer fallbackNumericId) {
        Integer steamNumeric;
        String playerSteamId = player.getSteamId();
        if (playerSteamId != null) {
            try {
                steamNumeric = Integer.parseInt(playerSteamId);
            } catch (NumberFormatException ignored) {
                steamNumeric = fallbackNumericId;
            }
        } else {
            steamNumeric = fallbackNumericId;
        }
        if (steamNumeric == null || steamNumeric <= 0) return;

        tryAttachJumpStats(player, steamNumeric);
        if (player.getJumpStatsPre() == null || player.getJumpStatsNoPre() == null) {
            int halfId = steamNumeric / 2;
            if (halfId > 0 && halfId != steamNumeric) {
                tryAttachJumpStats(player, halfId);
            }
        }
    }

    private void tryAttachJumpStats(SwayData player, int numericId) {
        if (numericId <= 0) return;
        String steam10 = "STEAM_1:0:" + numericId;
        String steam11 = "STEAM_1:1:" + numericId;
        String numericAsString = String.valueOf(numericId);

        if (player.getJumpStatsPre() == null) preRepo.findBySteamid(steam10).ifPresent(player::setJumpStatsPre);
        if (player.getJumpStatsPre() == null) preRepo.findBySteamid(steam11).ifPresent(player::setJumpStatsPre);
        if (player.getJumpStatsPre() == null) preRepo.findBySteamid(numericAsString).ifPresent(player::setJumpStatsPre);

        if (player.getJumpStatsNoPre() == null) noPreRepo.findBySteamid(steam10).ifPresent(player::setJumpStatsNoPre);
        if (player.getJumpStatsNoPre() == null) noPreRepo.findBySteamid(steam11).ifPresent(player::setJumpStatsNoPre);
        if (player.getJumpStatsNoPre() == null) noPreRepo.findBySteamid(numericAsString).ifPresent(player::setJumpStatsNoPre);
    }

    private Sort buildSort(String sortBy, String direction) {
        String normalized = sortBy == null ? "kills" : sortBy.trim().toLowerCase();
        String property;
        switch (normalized) {
            case "time":
            case "weektime":           property = "time"; break;
            case "mixelo":
            case "elo":                property = "mixelo"; break;
            case "mixgames":
            case "games":              property = "mixgames"; break;
            case "mixwon":
            case "won":                property = "mixwon"; break;
            case "mixdisconnects":
            case "disconnects":        property = "mixdisconnects"; break;
            case "mixtotalstabs":
            case "stabs":              property = "mixtotalstabs"; break;
            case "kills":
            default:                   property = "kills"; break;
        }
        if (!ALLOWED_SORT_PROPERTIES.contains(property)) property = "kills";
        Sort.Direction sortDirection = "ASC".equalsIgnoreCase(direction) ? Sort.Direction.ASC : Sort.Direction.DESC;
        return Sort.by(sortDirection, property);
    }
}
