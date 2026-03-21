package sway.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sway.entity.SwayData;
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

    // RUTA 1: Returnează toți jucătorii (folosită de Leaderboard)
    @GetMapping("/all")
    public List<SwayData> getAllPlayers() {
        return swayDataRepository.findAll();
    }

    // RUTA 2: Returnează un singur jucător + datele lui de Jump (folosită de Profil)
    @GetMapping("/{id}")
    public ResponseEntity<SwayData> getPlayerById(@PathVariable Integer id) {

        Optional<SwayData> playerOpt = swayDataRepository.findById(id);

        if (playerOpt.isPresent()) {
            SwayData player = playerOpt.get();
            String steamId = player.getSteamId();

            if (steamId != null && !steamId.isEmpty()) {
                // SCUT PENTRU DATELE PRE
                try {
                    preRepo.findBySteamid(steamId).ifPresent(player::setJumpStatsPre);
                } catch (Exception e) {
                    System.out.println("⚠️ Eroare PRE pentru SteamID " + steamId + ": " + e.getMessage());
                }

                // SCUT PENTRU DATELE NOPRE
                try {
                    noPreRepo.findBySteamid(steamId).ifPresent(player::setJumpStatsNoPre);
                } catch (Exception e) {
                    System.out.println("⚠️ Eroare NOPRE pentru SteamID " + steamId + ": " + e.getMessage());
                }
            }

            // Profilul se va afișa MEREU, chiar dacă săriturile dau eroare!
            return ResponseEntity.ok().body(player);
        }

        return ResponseEntity.notFound().build();
    }
}