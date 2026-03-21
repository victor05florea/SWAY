package sway.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import sway.entity.JumpStatNoPre;
import java.util.Optional;

public interface JumpStatNoPreRepository extends JpaRepository<JumpStatNoPre, Integer> {
    // Îl învățăm pe Java să caute după SteamID
    Optional<JumpStatNoPre> findBySteamid(String steamid);
}