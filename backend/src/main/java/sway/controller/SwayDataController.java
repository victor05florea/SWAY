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

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/players")
public class SwayDataController {

    // 1. Aducem Repository-ul principal (Baza de date generală)
    @Autowired
    private SwayDataRepository swayDataRepository;

    // 2. Aducem noile Repositoare pentru sărituri
    @Autowired
    private JumpStatPreRepository preRepo;

    @Autowired
    private JumpStatNoPreRepository noPreRepo;

    @Autowired
    private ServerUtilityRepository serverUtilityRepository;

    // RUTA 1: Returnează toți jucătorii (folosită de Leaderboard)
    @GetMapping("/all")
    public List<SwayData> getAllPlayers() {
        return swayDataRepository.findAll();
    }

    @GetMapping("/status") // Atenție: adresa va fi /api/players/status
    public List<ServerUtility> getServersStatus() {
        return serverUtilityRepository.findAll();
    }

    // RUTA 2: Returnează un singur jucător + datele lui de Jump (folosită de Profil)
    @GetMapping("/{id}")
    public ResponseEntity<SwayData> getPlayerById(@PathVariable String id) {

        Optional<SwayData> playerOpt = Optional.empty();

        try {
            // Transformăm textul din link în număr
            Integer numericId = Integer.parseInt(id);

            // 2. TRUCUL: Încercăm prima dată să-l găsim după SteamID (ex: 371937544 din Bans)
            try {
                playerOpt = swayDataRepository.findBySteamid(numericId);
            } catch (Exception e) {}

            // 3. TRUCUL: Dacă nu-l găsește, înseamnă că e ID-ul mic (ex: 1, 2, 3 din Leaderboard). Îl căutăm acolo!
            if (playerOpt.isEmpty()) {
                playerOpt = swayDataRepository.findById(numericId);
            }

        } catch (NumberFormatException e) {
            System.out.println("ID Invalid primit de la React: " + id);
        }

        if (playerOpt.isPresent()) {
            SwayData player = playerOpt.get();
            String rawSteamId = player.getSteamId();

            if (rawSteamId != null && !rawSteamId.isEmpty()) {

                // 1. TRANSLATORUL MAGIC
                String targetSteamId = rawSteamId; // Presupunem inițial că e deja text
                String alternativeSteamId = rawSteamId; // O rezervă pentru serverele vechi

                // Dacă ID-ul este doar un număr (cum e 371937544), îl transformăm în formatul STEAM_1:Y:Z
                if (rawSteamId.matches("\\d+")) {
                    try {
                        long accountId = Long.parseLong(rawSteamId);
                        long y = accountId % 2;
                        long z = accountId / 2;
                        targetSteamId = "STEAM_1:" + y + ":" + z;
                        alternativeSteamId = "STEAM_0:" + y + ":" + z; // În caz că pluginul salvează cu STEAM_0

                        System.out.println("🔄 Am tradus ID-ul " + rawSteamId + " în " + targetSteamId);
                    } catch (Exception e) {
                        System.out.println("Eroare la traducerea SteamID-ului: " + e.getMessage());
                    }
                }

                // 2. Căutăm datele PRE cu ID-ul tradus
                try {
                    // Încercăm prima dată cu STEAM_1...
                    Optional<sway.entity.JumpStatPre> preData = preRepo.findBySteamid(targetSteamId);
                    // Dacă nu merge, încercăm cu STEAM_0...
                    if (preData.isEmpty()) {
                        preData = preRepo.findBySteamid(alternativeSteamId);
                    }

                    preData.ifPresent(player::setJumpStatsPre);
                } catch (Exception e) {
                    System.out.println("⚠️ EROARE PRE: " + e.getMessage());
                }

                // 3. Căutăm datele NOPRE cu ID-ul tradus
                try {
                    Optional<sway.entity.JumpStatNoPre> noPreData = noPreRepo.findBySteamid(targetSteamId);
                    if (noPreData.isEmpty()) {
                        noPreData = noPreRepo.findBySteamid(alternativeSteamId);
                    }

                    noPreData.ifPresent(player::setJumpStatsNoPre);
                } catch (Exception e) {
                    System.out.println("⚠️ EROARE NOPRE: " + e.getMessage());
                }
            }

            // Calculăm Rank-ul
            int kills = player.getKills() != null ? player.getKills() : 0;
            int rank = swayDataRepository.countByKillsGreaterThan(kills) + 1;
            player.setServerRank(rank);

            return ResponseEntity.ok().body(player);
        }

        return ResponseEntity.notFound().build();
    }

}