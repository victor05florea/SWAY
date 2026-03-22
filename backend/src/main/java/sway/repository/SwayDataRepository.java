package sway.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import sway.entity.SwayData;
import java.util.Optional;

public interface SwayDataRepository extends JpaRepository<SwayData, Integer> {
    Integer countByKillsGreaterThan(Integer kills);

    Optional<SwayData> findBySteamid(Integer steamid);
}