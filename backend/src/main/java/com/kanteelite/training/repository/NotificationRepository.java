package com.kanteelite.training.repository;

import com.kanteelite.training.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserEmailOrderByCreatedAtDesc(String userEmail);
    List<Notification> findByUserEmailAndReadStatusFalseOrderByCreatedAtDesc(String userEmail);
    long countByUserEmailAndReadStatusFalse(String userEmail);
}
