package com.kanteelite.training.repository;

import com.kanteelite.training.entity.PlayerProgressNote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PlayerProgressNoteRepository extends JpaRepository<PlayerProgressNote, Long> {
    List<PlayerProgressNote> findByPlayerEmailIgnoreCaseOrderBySessionDateDesc(String playerEmail);
    List<PlayerProgressNote> findByCoachEmailIgnoreCaseOrderBySessionDateDesc(String coachEmail);
    List<PlayerProgressNote> findByPlayerEmailIgnoreCaseAndVisibleToParentTrueOrderBySessionDateDesc(String playerEmail);
    List<PlayerProgressNote> findByBookingIdOrderByCreatedAtDesc(Long bookingId);
}
