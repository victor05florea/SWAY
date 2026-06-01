package sway.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sway.entity.ServerUtility;
import sway.entity.SwayData;
import sway.repository.ServerUtilityRepository;
import sway.service.PlayerService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/players")
public class SwayDataController {

    @Autowired
    private PlayerService playerService;

    @Autowired
    private ServerUtilityRepository serverUtilityRepository;

    @GetMapping("/all")
    public List<SwayData> getAllPlayers() {
        return playerService.getAllPlayers();
    }

    @GetMapping("/status")
    public List<ServerUtility> getServersStatus() {
        return serverUtilityRepository.findAll();
    }

    @GetMapping("/count")
    public long getTotalPlayers() {
        return playerService.countPlayers();
    }

    @GetMapping("/page")
    public Map<String, Object> getPlayersPage(
            @RequestParam(defaultValue = "HNS") String mode,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(defaultValue = "kills") String sortBy,
            @RequestParam(defaultValue = "DESC") String direction,
            @RequestParam(defaultValue = "") String search
    ) {
        return playerService.getPlayersPage(mode, page, size, sortBy, direction, search);
    }

    @GetMapping("/potw")
    public ResponseEntity<SwayData> getPlayerOfTheWeek() {
        SwayData potw = playerService.getPlayerOfTheWeek();
        return potw != null ? ResponseEntity.ok(potw) : ResponseEntity.notFound().build();
    }

    @GetMapping("/{id}/rank/{mode}")
    public ResponseEntity<Integer> getPlayerRank(@PathVariable String id, @PathVariable String mode) {
        Integer rank = playerService.getPlayerRank(id, mode);
        if (rank == null) return ResponseEntity.notFound().build();
        if (rank < 0) return ResponseEntity.badRequest().build();
        return ResponseEntity.ok(rank);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SwayData> getPlayerById(@PathVariable String id) {
        SwayData player = playerService.getPlayerById(id);
        return player != null ? ResponseEntity.ok(player) : ResponseEntity.notFound().build();
    }
}
