package sway.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import sway.entity.SwayData;

public interface SwayDataRepository extends JpaRepository<SwayData, Integer> {
    Integer countByKillsGreaterThan(Integer kills);
}