package sway.controller;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.web.bind.annotation.*;
import sway.entity.Cheater;
import sway.repository.CheaterRepository;
import java.util.List;

@RestController
@RequestMapping("/api/cheaters")
@CrossOrigin(origins = {"https://sway.ovh", "localhost:5173"})
public class CheaterController {

    private final CheaterRepository cheaterRepository;

    public CheaterController(CheaterRepository cheaterRepository) {
        this.cheaterRepository = cheaterRepository;
    }

    @GetMapping
    @Cacheable("cheaters-all")
    public List<Cheater> getAllCheaters() {
        return cheaterRepository.findAllByOrderByIdDesc();
    }
}