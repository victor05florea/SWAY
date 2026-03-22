package sway.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import sway.entity.ServerUtility;
import java.util.Optional;

public interface ServerUtilityRepository extends JpaRepository<ServerUtility, Integer> {
    Optional<ServerUtility> findByServer(Integer server);
}