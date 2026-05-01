package sway.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import sway.entity.SwayData;
import java.util.Optional;

public interface SwayDataRepository extends JpaRepository<SwayData, Integer> {
    SwayData findTopByOrderByWeektimeDesc();
    int countByKillsGreaterThan(int kills);
    int countByMixeloGreaterThan(int mixelo);
    Optional<SwayData> findBySteamid(Integer steamid);
    Page<SwayData> findByNameContainingIgnoreCase(String name, Pageable pageable);
    Page<SwayData> findByMixgamesGreaterThan(Integer mixgames, Pageable pageable);
    Page<SwayData> findByNameContainingIgnoreCaseAndMixgamesGreaterThan(String name, Integer mixgames, Pageable pageable);
}