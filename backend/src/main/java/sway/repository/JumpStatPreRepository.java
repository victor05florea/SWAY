package sway.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import sway.entity.JumpStatPre;
import java.util.Optional;

public interface JumpStatPreRepository extends JpaRepository<JumpStatPre, Integer> {
    // Îl învățăm pe Java să caute după SteamID
    Optional<JumpStatPre> findBySteamid(String steamid);
}