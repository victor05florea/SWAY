package sway.controller;

import org.springframework.beans.factory.annotation.Autowired;
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
@CrossOrigin(origins = "*")
public class JumpStatsController {

    @Autowired
    private JumpStatPreRepository preRepo;

    @Autowired
    private JumpStatNoPreRepository nopreRepo;

    @GetMapping("/pre")
    public List<JumpStatPre> getAllPreJumps() {
        return preRepo.findAll();
    }

    @GetMapping("/nopre")
    public List<JumpStatNoPre> getAllNoPreJumps() {
        return nopreRepo.findAll();
    }
}