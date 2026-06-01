package sway.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import sway.config.CacheConfig;
import sway.entity.JumpStatPre;
import sway.entity.JumpStatNoPre;
import sway.repository.JumpStatPreRepository;
import sway.repository.JumpStatNoPreRepository;

import java.util.List;

@RestController
@RequestMapping("/api/jumps")
public class JumpStatsController {

    @Autowired
    private JumpStatPreRepository preRepo;

    @Autowired
    private JumpStatNoPreRepository nopreRepo;

    @GetMapping("/pre")
    @Cacheable(CacheConfig.CACHE_JUMPS_PRE)
    public List<JumpStatPre> getAllPreJumps() {
        return preRepo.findAll();
    }

    @GetMapping("/nopre")
    @Cacheable(CacheConfig.CACHE_JUMPS_NOPRE)
    public List<JumpStatNoPre> getAllNoPreJumps() {
        return nopreRepo.findAll();
    }
}
