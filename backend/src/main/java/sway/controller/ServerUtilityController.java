package sway.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import sway.entity.ServerUtility;
import sway.repository.ServerUtilityRepository;

import java.util.List;

@CrossOrigin(origins = "https://sway.ovh") // Ca să poată React să citească datele
@RestController
@RequestMapping("/api/servers") // Adresa va fi fix http://localhost:8080/api/servers
public class ServerUtilityController {

    @Autowired
    private ServerUtilityRepository serverUtilityRepository;

    @GetMapping
    public List<ServerUtility> getAllServers() {
        // Returnează lista celor 3 servere (HNS PRE, NOPRE, MIX)
        return serverUtilityRepository.findAll();
    }
}