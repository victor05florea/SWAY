package sway.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import sway.entity.SwayData;
import sway.repository.SwayDataRepository;
import java.util.List;

@CrossOrigin(origins = "http://localhost:5173") // Îi dăm voie React-ului să ne ceară date
@RestController // Îi spune lui Spring că această clasă va returna date (JSON), nu pagini HTML
@RequestMapping("/api/players") // Aceasta va fi baza URL-ului nostru
public class SwayDataController {

    // Aducem "Fereastra" către baza de date aici
    private final SwayDataRepository repository;

    // Constructorul este modul profesional de a injecta Repository-ul (Dependency Injection)
    public SwayDataController(SwayDataRepository repository) {
        this.repository = repository;
    }

    // Aceasta va fi afișată când accesezi doar localhost:8080
    @GetMapping("/")
    public String home() {
        return "Backend-ul pentru serverul de CS2 SWAY este ACTIV și conectat la baza de date! 🚀";
    }

    // Când cineva accesează /api/players/top, se va rula această metodă
    @GetMapping("/top")
    public List<SwayData> getTopPlayers() {
        // Folosim metoda magică pe care am definit-o în Repository
        return repository.findTop10ByOrderByKillsDesc();
    }


}