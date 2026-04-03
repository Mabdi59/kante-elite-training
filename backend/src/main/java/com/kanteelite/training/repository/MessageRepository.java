package com.kanteelite.training.repository;

import com.kanteelite.training.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByRecipientEmailIgnoreCaseOrderByCreatedAtDesc(String recipientEmail);
    List<Message> findBySenderEmailIgnoreCaseOrderByCreatedAtDesc(String senderEmail);
    List<Message> findByRecipientEmailIgnoreCaseAndReadStatusFalseOrderByCreatedAtDesc(String recipientEmail);
    long countByRecipientEmailIgnoreCaseAndReadStatusFalse(String recipientEmail);
    List<Message> findByParentIdOrderByCreatedAtAsc(Long parentId);
}
