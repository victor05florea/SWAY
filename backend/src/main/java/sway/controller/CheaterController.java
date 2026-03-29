package sway.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sway.entity.Cheater;
import sway.repository.CheaterRepository;
import java.util.List;

@RestController
@RequestMapping("/api/cheaters")
@CrossOrigin(origins = "https://sway.ovh")
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
    @GetMapping("/page")
    public Page<Cheater> getBansPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {

        return cheaterRepository.findAllByOrderByIdDesc(PageRequest.of(page, size));
    }
}