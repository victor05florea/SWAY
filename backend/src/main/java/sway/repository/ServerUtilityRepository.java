package sway.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sway.entity.ServerUtility;

@Repository
public interface ServerUtilityRepository extends JpaRepository<ServerUtility, Integer> {
    // Nu trebuie să scrii nimic aici înăuntru!
    // JpaRepository îți dă automat findAll(), findById(), count(), etc.
}