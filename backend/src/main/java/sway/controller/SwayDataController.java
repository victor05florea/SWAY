package sway.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sway.entity.ServerUtility;
import sway.entity.SwayData;
import sway.repository.ServerUtilityRepository;
import sway.repository.SwayDataRepository;
import sway.repository.JumpStatPreRepository;
import sway.repository.JumpStatNoPreRepository;

import java.util.List;
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
    @Cacheable("players-all")
    public List<SwayData> getAllPlayers() {
        return swayDataRepository.findAll();
    }

    @GetMapping("/status")
    @Cacheable("players-status")
    public List<ServerUtility> getServersStatus() {
        return serverUtilityRepository.findAll();
    }


    // --- RUTE NOI (Super-Rapide / Optimizate) ---

    // 1. Returnează doar numărul total de jucători
    @GetMapping("/count")
    @Cacheable("players-count")
    public long getTotalPlayers() {
        return swayDataRepository.count();
    }

    // 2. Returnează instant Player of the Week (bazat pe weektime)
    @GetMapping("/potw")
    public ResponseEntity<SwayData> getPlayerOfTheWeek() {
        SwayData potw = swayDataRepository.findTopByOrderByWeektimeDesc();

        if (potw != null) {
            int kills = potw.getKills() != null ? potw.getKills() : 0;
            int rank = swayDataRepository.countByKillsGreaterThan(kills) + 1;
            potw.setServerRank(rank);
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

        String directId = "STEAM_1:0:" + steamNumeric;
        preRepo.findBySteamid(directId).ifPresent(player::setJumpStatsPre);
        noPreRepo.findBySteamid(directId).ifPresent(player::setJumpStatsNoPre);

        if (player.getJumpStatsPre() == null || player.getJumpStatsNoPre() == null) {
            int halfId = steamNumeric / 2;
            if (halfId > 0 && halfId != steamNumeric) {
                String halfBasedId = "STEAM_1:0:" + halfId;
                if (player.getJumpStatsPre() == null) {
                    preRepo.findBySteamid(halfBasedId).ifPresent(player::setJumpStatsPre);
                }
                if (player.getJumpStatsNoPre() == null) {
                    noPreRepo.findBySteamid(halfBasedId).ifPresent(player::setJumpStatsNoPre);
                }
            }
        }
    }
}