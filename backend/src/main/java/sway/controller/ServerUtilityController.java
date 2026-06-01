package sway.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.web.bind.annotation.*;
import sway.config.CacheConfig;
import sway.entity.ServerUtility;
import sway.repository.ServerUtilityRepository;

import java.util.List;

@RestController
@RequestMapping("/api/servers")
public class ServerUtilityController {

    @Autowired
    private ServerUtilityRepository serverUtilityRepository;

    @GetMapping
    @Cacheable(CacheConfig.CACHE_SERVERS)
    public List<ServerUtility> getAllServers() {
        return serverUtilityRepository.findAll();
    }
}
