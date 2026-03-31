package com.kanteelite.training.repository;

import com.kanteelite.training.entity.EventParticipant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EventParticipantRepository extends JpaRepository<EventParticipant, Long> {
    List<EventParticipant> findByEventIdOrderByCreatedAtAsc(Long eventId);
    long countByEventId(Long eventId);
    boolean existsByEventIdAndUserId(Long eventId, Long userId);
    boolean existsByEventIdAndPlayerProfileId(Long eventId, Long playerProfileId);
    Optional<EventParticipant> findByIdAndEventId(Long id, Long eventId);
}
