package com.kanteelite.training.repository;

import com.kanteelite.training.entity.RegistrationHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RegistrationHistoryRepository extends JpaRepository<RegistrationHistory, Long> {
    List<RegistrationHistory> findByRegistrationIdOrderByCreatedAtDesc(Long registrationId);
    void deleteByRegistrationId(Long registrationId);
}
