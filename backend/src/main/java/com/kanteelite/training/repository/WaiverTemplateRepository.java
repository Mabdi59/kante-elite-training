package com.kanteelite.training.repository;

import com.kanteelite.training.entity.WaiverTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface WaiverTemplateRepository extends JpaRepository<WaiverTemplate, Long> {
    List<WaiverTemplate> findByActiveTrueOrderByCreatedAtDesc();
}
