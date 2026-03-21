package sway.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sway.entity.SwayData;
import java.util.List;

@Repository
public interface SwayDataRepository extends JpaRepository<SwayData, Integer> {

    // Spring Boot "înțelege" automat limba engleză.
    // Dacă scrii "findTop10ByOrderByKillsDesc", el va genera automat comanda SQL:
    // SELECT * FROM SWAY_Data ORDER BY kills DESC LIMIT 10;

    List<SwayData> findTop10ByOrderByKillsDesc();

    // Poți adăuga și alte interogări utile
    SwayData findBySteamid(Integer steamid);
}