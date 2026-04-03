package com.kanteelite.training.repository;

import com.kanteelite.training.entity.PlayerProgressNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PlayerProgressNoteRepository extends JpaRepository<PlayerProgressNote, Long> {
    // Email-based (used when player has no user account)
    List<PlayerProgressNote> findByPlayerEmailIgnoreCaseOrderBySessionDateDesc(String playerEmail);
    List<PlayerProgressNote> findByCoachEmailIgnoreCaseOrderBySessionDateDesc(String coachEmail);
    List<PlayerProgressNote> findByPlayerEmailIgnoreCaseAndVisibleToParentTrueOrderBySessionDateDesc(String playerEmail);

    // User-ID-based (preferred; stable even if email changes)
    List<PlayerProgressNote> findByPlayerUserIdOrderBySessionDateDesc(Long playerUserId);
    List<PlayerProgressNote> findByCoachUserIdOrderBySessionDateDesc(Long coachUserId);
    List<PlayerProgressNote> findByPlayerUserIdAndVisibleToParentTrueOrderBySessionDateDesc(Long playerUserId);

    // Combined: match by user_id OR email fallback
    @Query("SELECT n FROM PlayerProgressNote n WHERE (n.playerUser.id = :userId OR LOWER(n.playerEmail) = LOWER(:email)) ORDER BY n.sessionDate DESC")
    List<PlayerProgressNote> findByPlayerUserIdOrEmail(@Param("userId") Long userId, @Param("email") String email);

    @Query("SELECT n FROM PlayerProgressNote n WHERE (n.playerUser.id = :userId OR LOWER(n.playerEmail) = LOWER(:email)) AND n.visibleToParent = true ORDER BY n.sessionDate DESC")
    List<PlayerProgressNote> findVisibleByPlayerUserIdOrEmail(@Param("userId") Long userId, @Param("email") String email);

    List<PlayerProgressNote> findByBookingIdOrderByCreatedAtDesc(Long bookingId);
}
