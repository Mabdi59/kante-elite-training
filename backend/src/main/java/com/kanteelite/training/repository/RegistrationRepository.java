package com.kanteelite.training.repository;

import com.kanteelite.training.entity.Registration;
import com.kanteelite.training.enums.RegistrationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, Long> {
    List<Registration> findBySessionIdOrderByRegisteredAtAsc(Long sessionId);
    List<Registration> findAllByOrderByRegisteredAtDesc();
    long countBySessionIdAndStatus(Long sessionId, RegistrationStatus status);
    Optional<Registration> findFirstBySessionIdAndStatusOrderByRegisteredAtAsc(Long sessionId, RegistrationStatus status);
    boolean existsBySessionIdAndPlayerProfileIdAndStatusNot(Long sessionId, Long playerProfileId, RegistrationStatus status);
    boolean existsBySessionIdAndUserIdAndStatusNot(Long sessionId, Long userId, RegistrationStatus status);
}
