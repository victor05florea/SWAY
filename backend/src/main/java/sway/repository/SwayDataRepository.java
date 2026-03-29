package sway.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import sway.entity.SwayData;
import java.util.Optional;

public interface SwayDataRepository extends JpaRepository<SwayData, Integer> {
    SwayData findTopByOrderByWeektimeDesc();
    int countByKillsGreaterThan(int kills);
    int countByMixeloGreaterThan(int mixelo);
    Integer countByKillsGreaterThan(Integer kills);
    Optional<SwayData> findBySteamid(Integer steamid);
    Optional<SwayData> findBySteamId(String steamId);
}