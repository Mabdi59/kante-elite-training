package com.kanteelite.training.repository;

import com.kanteelite.training.entity.Program;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProgramRepository extends JpaRepository<Program, Long> {
    List<Program> findByActiveTrueOrderByDisplayOrderAsc();
    Optional<Program> findBySlug(String slug);
    Optional<Program> findBySlugAndActiveTrue(String slug);
}
