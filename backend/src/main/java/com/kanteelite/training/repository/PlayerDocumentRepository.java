package com.kanteelite.training.repository;

import com.kanteelite.training.entity.PlayerDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PlayerDocumentRepository extends JpaRepository<PlayerDocument, Long> {
    List<PlayerDocument> findByPlayerEmailIgnoreCaseOrderByCreatedAtDesc(String playerEmail);
}
