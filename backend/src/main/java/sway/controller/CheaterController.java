package sway.controller;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.web.bind.annotation.*;
import sway.config.CacheConfig;
import sway.entity.Cheater;
import sway.repository.CheaterRepository;

import java.util.List;

@RestController
@RequestMapping("/api/cheaters")
public class CheaterController {

    private final CheaterRepository cheaterRepository;

    public CheaterController(CheaterRepository cheaterRepository) {
        this.cheaterRepository = cheaterRepository;
    }

    @GetMapping
    @Cacheable(CacheConfig.CACHE_CHEATERS)
    public List<Cheater> getAllCheaters() {
        return cheaterRepository.findAllByOrderByIdDesc();
    }
}
