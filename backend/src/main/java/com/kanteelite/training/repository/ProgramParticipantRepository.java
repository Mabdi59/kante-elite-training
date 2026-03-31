package com.kanteelite.training.repository;

import com.kanteelite.training.entity.ProgramParticipant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProgramParticipantRepository extends JpaRepository<ProgramParticipant, Long> {
    List<ProgramParticipant> findByProgramIdOrderByCreatedAtAsc(Long programId);
    long countByProgramId(Long programId);
    boolean existsByProgramIdAndUserId(Long programId, Long userId);
    boolean existsByProgramIdAndPlayerProfileId(Long programId, Long playerProfileId);
    Optional<ProgramParticipant> findByIdAndProgramId(Long id, Long programId);
}
