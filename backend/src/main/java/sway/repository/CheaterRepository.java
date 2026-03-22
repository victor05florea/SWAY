package sway.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import sway.entity.Cheater;
import java.util.List;

public interface CheaterRepository extends JpaRepository<Cheater, Integer> {
    // Aduce toți codații, ordonați descrescător după ID (cei mai noi sus)
    List<Cheater> findAllByOrderByIdDesc();
}