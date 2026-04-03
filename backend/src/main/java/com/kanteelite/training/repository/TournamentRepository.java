package com.kanteelite.training.repository;

import com.kanteelite.training.entity.Tournament;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TournamentRepository extends JpaRepository<Tournament, Long> {
    List<Tournament> findAllByOrderByStartDateAsc();

    @Query("SELECT t FROM Tournament t WHERE LOWER(t.name) LIKE LOWER(CONCAT('%', :q, '%')) ORDER BY t.name ASC")
    List<Tournament> searchByQuery(@Param("q") String q, org.springframework.data.domain.Pageable pageable);
}
