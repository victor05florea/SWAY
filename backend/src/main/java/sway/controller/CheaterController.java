package sway.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sway.entity.Cheater;
import sway.repository.CheaterRepository;
import java.util.List;

@RestController
@RequestMapping("/api/cheaters")
@CrossOrigin(origins="*")
public class CheaterController {

    private final CheaterRepository cheaterRepository;

    public CheaterController(CheaterRepository cheaterRepository) {
        this.cheaterRepository = cheaterRepository;
    }

    @GetMapping
    public ResponseEntity<List<Cheater>> getAllCheaters() {
        List<Cheater> cheaters = cheaterRepository.findAllByOrderByIdDesc();
        return ResponseEntity.ok(cheaters);
    }
}