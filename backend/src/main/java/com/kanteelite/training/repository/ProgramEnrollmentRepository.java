package com.kanteelite.training.repository;

import com.kanteelite.training.entity.ProgramEnrollment;
import com.kanteelite.training.enums.EnrollmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ProgramEnrollmentRepository extends JpaRepository<ProgramEnrollment, Long> {
    List<ProgramEnrollment> findByPlayerEmailIgnoreCaseOrderByCreatedAtDesc(String playerEmail);
    List<ProgramEnrollment> findByProgramIdOrderByCreatedAtDesc(Long programId);
    List<ProgramEnrollment> findByStatusOrderByCreatedAtDesc(EnrollmentStatus status);
    Optional<ProgramEnrollment> findByProgramIdAndPlayerEmailIgnoreCase(Long programId, String playerEmail);
    boolean existsByProgramIdAndPlayerEmailIgnoreCase(Long programId, String playerEmail);
}
