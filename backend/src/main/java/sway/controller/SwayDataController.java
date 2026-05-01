package sway.controller;

import org.springframework.beans.factory.annotation.Autowired;
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
    @GetMapping("/{id}")
    public ResponseEntity<SwayData> getPlayerById(@PathVariable String id) {
        Optional<SwayData> playerOpt = Optional.empty();

        // 1. Căutăm după SteamID (String)
        try {
            playerOpt = swayDataRepository.findBySteamId(id);
        } catch (Exception ignored) {}

        // 2. Dacă nu l-a găsit, căutăm după ID numeric
        if (!playerOpt.isPresent()) {
            try {
                Integer numericId = Integer.parseInt(id);
                playerOpt = swayDataRepository.findBySteamid(numericId);
                if (!playerOpt.isPresent()) {
                    playerOpt = swayDataRepository.findById(numericId);
                }
            } catch (NumberFormatException ignored) {}
        }

        if (playerOpt.isPresent()) {
            SwayData player = playerOpt.get();

            // --- Logica de JumpStats (Reparată pentru Java 8) ---
            String rawSteamId = player.getSteamId();
            if (rawSteamId != null && !rawSteamId.isEmpty()) {
                // ... (logica ta de conversie SteamID rămâne la fel) ...

                // Exemplu de fix pentru jumpstats:
                Optional<sway.entity.JumpStatPre> preData = preRepo.findBySteamid(rawSteamId);
                if (!preData.isPresent()) {
                    // Încearcă varianta alternativă dacă prima lipsește
                }
                preData.ifPresent(player::setJumpStatsPre);
            }

            int kills = player.getKills() != null ? player.getKills() : 0;
            player.setServerRank(swayDataRepository.countByKillsGreaterThan(kills) + 1);

            return ResponseEntity.ok().body(player);
        }
        return ResponseEntity.notFound().build();
    }
}