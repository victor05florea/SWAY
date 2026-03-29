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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "https://sway.ovh")
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
    @GetMapping("/{id}/rank/{mode}")
    public ResponseEntity<Integer> getPlayerRank(@PathVariable String id, @PathVariable String mode) {
        Optional<SwayData> playerOpt = Optional.empty();

        try {
            Integer numericId = Integer.parseInt(id);
            playerOpt = swayDataRepository.findBySteamid(numericId);
            if (playerOpt.isEmpty()) {
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
                // Dacă getter-ul tău e diferit, schimbă `getMixelo()` cu cel corect (ex: getMixElo())
                int mixelo = player.getMixelo() != null ? player.getMixelo() : 0;
                return ResponseEntity.ok(swayDataRepository.countByMixeloGreaterThan(mixelo) + 1);
            }
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/page")
    public Page<SwayData> getPlayersPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(defaultValue = "kills") String sortBy) {

        if ("mix".equalsIgnoreCase(sortBy)) {
            return swayDataRepository.findAllByOrderByMixeloDesc(PageRequest.of(page, size));
        }
        return swayDataRepository.findAllByOrderByKillsDesc(PageRequest.of(page, size));
    }


    // --- RUTA COMPLEXĂ PENTRU PROFIL ---

    @GetMapping("/{id}")
    public ResponseEntity<SwayData> getPlayerById(@PathVariable String id) {

        Optional<SwayData> playerOpt = Optional.empty();

        // 1. Căutăm direct după text (ex: STEAM_1:0:123456)
        try {
            // Folosim metoda NOUĂ pe care tocmai am adăugat-o în Repository
            playerOpt = swayDataRepository.findBySteamId(id);
        } catch (Exception ignored) {}

        // 2. Dacă nu l-a găsit după text, înseamnă că e un număr simplu (ex: ID-ul 5 din Leaderboard)
        if (playerOpt.isEmpty()) {
            try {
                Integer numericId = Integer.parseInt(id);

                // Aplicăm logica ta originală de căutare după număr
                playerOpt = swayDataRepository.findBySteamid(numericId);

                if (playerOpt.isEmpty()) {
                    playerOpt = swayDataRepository.findById(numericId);
                }
            } catch (NumberFormatException ignored) {
                // Dacă tot dă eroare, o ignorăm silențios
            }
        }

        if (playerOpt.isPresent()) {
            SwayData player = playerOpt.get();
            String rawSteamId = player.getSteamId();

            if (rawSteamId != null && !rawSteamId.isEmpty()) {
                String targetSteamId = rawSteamId;
                String alternativeSteamId = rawSteamId;

                if (rawSteamId.matches("\\d+")) {
                    try {
                        long accountId = Long.parseLong(rawSteamId);
                        long y = accountId % 2;
                        long z = accountId / 2;
                        targetSteamId = "STEAM_1:" + y + ":" + z;
                        alternativeSteamId = "STEAM_0:" + y + ":" + z;
                    } catch (Exception ignored) {}
                }

                try {
                    Optional<sway.entity.JumpStatPre> preData = preRepo.findBySteamid(targetSteamId);
                    if (preData.isEmpty()) {
                        preData = preRepo.findBySteamid(alternativeSteamId);
                    }
                    preData.ifPresent(player::setJumpStatsPre);
                } catch (Exception ignored) {}

                try {
                    Optional<sway.entity.JumpStatNoPre> noPreData = noPreRepo.findBySteamid(targetSteamId);
                    if (noPreData.isEmpty()) {
                        noPreData = noPreRepo.findBySteamid(alternativeSteamId);
                    }
                    noPreData.ifPresent(player::setJumpStatsNoPre);
                } catch (Exception ignored) {}
            }

            int kills = player.getKills() != null ? player.getKills() : 0;
            int rank = swayDataRepository.countByKillsGreaterThan(kills) + 1;
            player.setServerRank(rank);

            return ResponseEntity.ok().body(player);
        }

        return ResponseEntity.notFound().build();
    }
}