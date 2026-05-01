package sway.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sway.entity.ServerUtility;
import sway.entity.SwayData;
import sway.repository.ServerUtilityRepository;
import sway.repository.SwayDataRepository;
import sway.repository.JumpStatPreRepository;
import sway.repository.JumpStatNoPreRepository;

import java.util.List;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = {"https://sway.ovh", "http://localhost:5173"})
@RestController
@RequestMapping("/api/players")
public class SwayDataController {

    @Autowired
    private SwayDataRepository swayDataRepository;

    @Autowired
    private JumpStatPreRepository preRepo;

    @Autowired
    private JumpStatNoPreRepository noPreRepo;

    @Autowired
    private ServerUtilityRepository serverUtilityRepository;

    // --- RUTE VECHI (Păstrate pentru compatibilitate) ---

    @GetMapping("/all")
    public List<SwayData> getAllPlayers() {
        return swayDataRepository.findAll();
    }

    @GetMapping("/status")
    public List<ServerUtility> getServersStatus() {
        return serverUtilityRepository.findAll();
    }


    // --- RUTE NOI (Super-Rapide / Optimizate) ---

    // 1. Returnează doar numărul total de jucători
    @GetMapping("/count")
    public long getTotalPlayers() {
        return swayDataRepository.count();
    }

    @GetMapping("/page")
    public ResponseEntity<Map<String, Object>> getPlayersPage(
            @RequestParam(defaultValue = "HNS") String mode,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(defaultValue = "kills") String sortBy,
            @RequestParam(defaultValue = "DESC") String direction,
            @RequestParam(defaultValue = "") String search
    ) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 100);
        Sort sort = buildSort(sortBy, direction);
        Pageable pageable = PageRequest.of(safePage, safeSize, sort);
        String safeSearch = search == null ? "" : search.trim();

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
        return ResponseEntity.ok(payload);
    }

    // 2. Returnează instant Player of the Week (bazat pe weektime)
    @GetMapping("/potw")
    public ResponseEntity<SwayData> getPlayerOfTheWeek() {
        SwayData potw = swayDataRepository.findTopByOrderByWeektimeDesc();

        if (potw != null) {
            int kills = potw.getKills() != null ? potw.getKills() : 0;
            int rank = swayDataRepository.countByKillsGreaterThan(kills) + 1;
            potw.setServerRank(rank);
            int mixGames = potw.getMixgames() != null ? potw.getMixgames() : 0;
            if (mixGames > 0) {
                int mixElo = potw.getMixelo() != null ? potw.getMixelo() : 0;
                potw.setMixRank(swayDataRepository.countByMixeloGreaterThan(mixElo) + 1);
            } else {
                potw.setMixRank(null);
            }
            return ResponseEntity.ok(potw);
        }
        return ResponseEntity.notFound().build();
    }

    // 3. Returnează rank-ul unui jucător pe un anumit mod ("hns" sau "mix")
    // --- RUTA PENTRU RANK ---
    @GetMapping("/{id}/rank/{mode}")
    public ResponseEntity<Integer> getPlayerRank(@PathVariable String id, @PathVariable String mode) {
        Optional<SwayData> playerOpt = Optional.empty();

        try {
            Integer numericId = Integer.parseInt(id);
            playerOpt = swayDataRepository.findBySteamid(numericId);
            // Înlocuit .isEmpty() cu ! .isPresent()
            if (!playerOpt.isPresent()) {
                playerOpt = swayDataRepository.findById(numericId);
            }
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().build();
        }

        if (playerOpt.isPresent()) {
            SwayData player = playerOpt.get();
            if ("hns".equalsIgnoreCase(mode)) {
                int kills = player.getKills() != null ? player.getKills() : 0;
                return ResponseEntity.ok(swayDataRepository.countByKillsGreaterThan(kills) + 1);
            } else if ("mix".equalsIgnoreCase(mode)) {
                int mixelo = player.getMixelo() != null ? player.getMixelo() : 0;
                return ResponseEntity.ok(swayDataRepository.countByMixeloGreaterThan(mixelo) + 1);
            }
        }
        return ResponseEntity.notFound().build();
    }

    // --- RUTA PENTRU PROFIL ---
    // --- RUTA PENTRU PROFIL (REPARATĂ) ---
    @GetMapping("/{id}")
    public ResponseEntity<SwayData> getPlayerById(@PathVariable String id) {
        Integer numericId = parseNumericId(id);
        if (numericId == null) {
            return ResponseEntity.notFound().build();
        }

        Optional<SwayData> playerOpt = findPlayerByAnyIdFormat(numericId);

        if (playerOpt.isPresent()) {
            SwayData player = playerOpt.get();

            try {
                attachJumpStats(player, numericId);
            } catch (Exception ignored) {
                // Keep profile endpoint available even when jump tables are unavailable.
            }

            int kills = player.getKills() != null ? player.getKills() : 0;
            player.setServerRank(swayDataRepository.countByKillsGreaterThan(kills) + 1);

            return ResponseEntity.ok().body(player);
        }

        return ResponseEntity.notFound().build();
    }

    private Integer parseNumericId(String rawId) {
        if (rawId == null || rawId.trim().isEmpty()) {
            return null;
        }

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
        if (playerOpt.isPresent()) {
            return playerOpt;
        }

        playerOpt = swayDataRepository.findById(numericId);
        if (playerOpt.isPresent()) {
            return playerOpt;
        }

        // Some frontend sources send Steam AccountID, while DB stores Steam2 Z-part.
        int normalizedSteam2Z = numericId / 2;
        if (normalizedSteam2Z > 0 && normalizedSteam2Z != numericId) {
            playerOpt = swayDataRepository.findBySteamid(normalizedSteam2Z);
            if (playerOpt.isPresent()) {
                return playerOpt;
            }
            return swayDataRepository.findById(normalizedSteam2Z);
        }

        return Optional.empty();
    }

    private void attachJumpStats(SwayData player, Integer fallbackNumericId) {
        Integer steamNumeric = null;
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

        if (steamNumeric == null || steamNumeric <= 0) {
            return;
        }

        tryAttachJumpStats(player, steamNumeric);

        if (player.getJumpStatsPre() == null || player.getJumpStatsNoPre() == null) {
            int halfId = steamNumeric / 2;
            if (halfId > 0 && halfId != steamNumeric) {
                tryAttachJumpStats(player, halfId);
            }
        }
    }

    private void tryAttachJumpStats(SwayData player, int numericId) {
        if (numericId <= 0) {
            return;
        }

        String steam10 = "STEAM_1:0:" + numericId;
        String steam11 = "STEAM_1:1:" + numericId;
        String numericAsString = String.valueOf(numericId);

        if (player.getJumpStatsPre() == null) {
            preRepo.findBySteamid(steam10).ifPresent(player::setJumpStatsPre);
        }
        if (player.getJumpStatsPre() == null) {
            preRepo.findBySteamid(steam11).ifPresent(player::setJumpStatsPre);
        }
        if (player.getJumpStatsPre() == null) {
            preRepo.findBySteamid(numericAsString).ifPresent(player::setJumpStatsPre);
        }

        if (player.getJumpStatsNoPre() == null) {
            noPreRepo.findBySteamid(steam10).ifPresent(player::setJumpStatsNoPre);
        }
        if (player.getJumpStatsNoPre() == null) {
            noPreRepo.findBySteamid(steam11).ifPresent(player::setJumpStatsNoPre);
        }
        if (player.getJumpStatsNoPre() == null) {
            noPreRepo.findBySteamid(numericAsString).ifPresent(player::setJumpStatsNoPre);
        }
    }

    private Sort buildSort(String sortBy, String direction) {
        String normalized = sortBy == null ? "kills" : sortBy.trim().toLowerCase();
        String property;
        switch (normalized) {
            case "time":
            case "weektime":
                property = "time";
                break;
            case "mixelo":
            case "elo":
                property = "mixelo";
                break;
            case "mixgames":
            case "games":
                property = "mixgames";
                break;
            case "mixwon":
            case "won":
                property = "mixwon";
                break;
            case "mixdisconnects":
            case "disconnects":
                property = "mixdisconnects";
                break;
            case "mixtotalstabs":
            case "stabs":
                property = "mixtotalstabs";
                break;
            case "kills":
            default:
                property = "kills";
                break;
        }

        Sort.Direction sortDirection = "ASC".equalsIgnoreCase(direction) ? Sort.Direction.ASC : Sort.Direction.DESC;
        return Sort.by(sortDirection, property);
    }
}