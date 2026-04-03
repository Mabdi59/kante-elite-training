package com.kanteelite.training.repository;

import com.kanteelite.training.entity.SignedWaiver;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SignedWaiverRepository extends JpaRepository<SignedWaiver, Long> {
    List<SignedWaiver> findByUserEmailIgnoreCaseOrderBySignedAtDesc(String userEmail);
    Optional<SignedWaiver> findByTemplateIdAndUserEmailIgnoreCase(Long templateId, String userEmail);
    boolean existsByTemplateIdAndUserEmailIgnoreCase(Long templateId, String userEmail);
}
