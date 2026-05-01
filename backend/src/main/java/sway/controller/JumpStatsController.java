package sway.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import sway.entity.JumpStatPre;
import sway.entity.JumpStatNoPre;
import sway.repository.JumpStatPreRepository;
import sway.repository.JumpStatNoPreRepository;

import java.util.List;

@RestController
@RequestMapping("/api/jumps")
@CrossOrigin(origins = {"https://sway.ovh", "http://localhost:5173"})
public class JumpStatsController {

    @Autowired
    private JumpStatPreRepository preRepo;

    @Autowired
    private JumpStatNoPreRepository nopreRepo;

    @GetMapping("/pre")
    @Cacheable("jumps-pre")
    public List<JumpStatPre> getAllPreJumps() {
        return preRepo.findAll();
    }

    @GetMapping("/nopre")
    @Cacheable("jumps-nopre")
    public List<JumpStatNoPre> getAllNoPreJumps() {
        return nopreRepo.findAll();
    }
}