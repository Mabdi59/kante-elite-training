package com.kanteelite.training.repository;

import com.kanteelite.training.entity.Program;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProgramRepository extends JpaRepository<Program, Long> {
    List<Program> findByActiveTrueOrderByDisplayOrderAsc();
    Optional<Program> findBySlug(String slug);
    Optional<Program> findBySlugAndActiveTrue(String slug);

    @Query("SELECT p FROM Program p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(COALESCE(p.description, '')) LIKE LOWER(CONCAT('%', :q, '%')) ORDER BY p.name ASC")
    List<Program> searchByQuery(@Param("q") String q, org.springframework.data.domain.Pageable pageable);
}
