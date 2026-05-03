package com.kanteelite.training.repository;

import com.kanteelite.training.entity.TrainingSession;
import com.kanteelite.training.enums.TrainingSessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface TrainingSessionRepository extends JpaRepository<TrainingSession, Long> {

    Optional<TrainingSession> findFirstByProgramIdAndScheduledDateAndStartTimeAndStatusNotOrderByCreatedAtAsc(
            Long programId,
            LocalDate scheduledDate,
            String startTime,
            TrainingSessionStatus status
    );

    @Query("""
            SELECT s FROM TrainingSession s
            LEFT JOIN FETCH s.program
            LEFT JOIN FETCH s.event
            LEFT JOIN FETCH s.coachUser
            LEFT JOIN FETCH s.sessionSeries
            WHERE s.id = :id
            """)
    Optional<TrainingSession> findByIdWithDetails(@Param("id") Long id);

    List<TrainingSession> findByProgramIdAndScheduledDateAndStatusNotOrderByStartTimeAsc(
            Long programId,
            LocalDate scheduledDate,
            TrainingSessionStatus status
    );

    @Query("""
            SELECT s FROM TrainingSession s
            LEFT JOIN FETCH s.program
            LEFT JOIN FETCH s.event
            LEFT JOIN FETCH s.coachUser
            LEFT JOIN FETCH s.sessionSeries
            WHERE s.event.id = :eventId
              AND s.status <> :excludedStatus
            ORDER BY s.scheduledDate ASC, s.startTime ASC
            """)
    List<TrainingSession> findPublicEventSessions(
            @Param("eventId") Long eventId,
            @Param("excludedStatus") TrainingSessionStatus excludedStatus
    );

    List<TrainingSession> findBySessionSeriesIdOrderByScheduledDateAscStartTimeAsc(Long sessionSeriesId);

    List<TrainingSession> findBySessionSeriesIdAndScheduledDateGreaterThanEqualOrderByScheduledDateAscStartTimeAsc(
            Long sessionSeriesId,
            LocalDate scheduledDate
    );

    long countBySessionSeriesId(Long sessionSeriesId);

    long countByScheduledDateAndStatusNot(LocalDate scheduledDate, TrainingSessionStatus status);

    long countByScheduledDateGreaterThanEqualAndStatusNot(LocalDate scheduledDate, TrainingSessionStatus status);

    long countByProgramIdAndScheduledDateAndStartTimeAndStatusIn(
            Long programId,
            LocalDate scheduledDate,
            String startTime,
            Collection<TrainingSessionStatus> statuses
    );

    @Query("""
            SELECT CASE WHEN COUNT(s) > 0 THEN true ELSE false END
            FROM TrainingSession s
            WHERE s.coachUser.id = :coachUserId
              AND s.scheduledDate = :scheduledDate
              AND s.startTime = :startTime
              AND s.status <> :excludedStatus
              AND s.id <> :sessionId
            """)
    boolean existsCoachConflict(
            @Param("coachUserId") Long coachUserId,
            @Param("scheduledDate") LocalDate scheduledDate,
            @Param("startTime") String startTime,
            @Param("excludedStatus") TrainingSessionStatus excludedStatus,
            @Param("sessionId") Long sessionId
    );
}
