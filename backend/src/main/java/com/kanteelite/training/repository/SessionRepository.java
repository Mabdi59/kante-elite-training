package com.kanteelite.training.repository;

import com.kanteelite.training.entity.Session;
import com.kanteelite.training.enums.SessionSourceType;
import com.kanteelite.training.enums.SessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SessionRepository extends JpaRepository<Session, Long> {

    List<Session> findBySourceTypeAndSourceIdOrderByStartDatetimeAsc(SessionSourceType sourceType, Long sourceId);

    List<Session> findBySourceTypeAndSourceIdAndStartDatetimeGreaterThanEqualOrderByStartDatetimeAsc(
            SessionSourceType sourceType, Long sourceId, LocalDateTime startDatetime);

    void deleteBySourceTypeAndSourceIdAndStartDatetimeGreaterThanEqual(
            SessionSourceType sourceType, Long sourceId, LocalDateTime fromDatetime);

    List<Session> findByStatusAndStartDatetimeGreaterThanEqualOrderByStartDatetimeAsc(
            SessionStatus status, LocalDateTime startDatetime);

    List<Session> findByStartDatetimeGreaterThanEqualOrderByStartDatetimeAsc(LocalDateTime startDatetime);

    long countBySourceTypeAndSourceIdAndStartDatetimeGreaterThanEqual(
            SessionSourceType sourceType, Long sourceId, LocalDateTime startDatetime);

    @Query("""
            SELECT s FROM Session s
            WHERE s.coachUser.id = :coachId
              AND s.status <> com.kanteelite.training.enums.SessionStatus.CANCELLED
              AND s.startDatetime < :endDatetime
              AND s.endDatetime > :startDatetime
            """)
    List<Session> findOverlappingSessions(
            @Param("coachId") Long coachId,
            @Param("startDatetime") LocalDateTime startDatetime,
            @Param("endDatetime") LocalDateTime endDatetime);

    @Query("""
            SELECT COUNT(s) > 0 FROM Session s
            WHERE s.coachUser.id = :coachId
              AND s.status <> com.kanteelite.training.enums.SessionStatus.CANCELLED
              AND s.startDatetime < :endDatetime
              AND s.endDatetime > :startDatetime
            """)
    boolean existsOverlappingSession(
            @Param("coachId") Long coachId,
            @Param("startDatetime") LocalDateTime startDatetime,
            @Param("endDatetime") LocalDateTime endDatetime);
}
