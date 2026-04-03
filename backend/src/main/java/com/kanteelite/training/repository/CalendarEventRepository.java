package com.kanteelite.training.repository;

import com.kanteelite.training.entity.CalendarEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface CalendarEventRepository extends JpaRepository<CalendarEvent, Long> {
    List<CalendarEvent> findByOwnerEmailIgnoreCaseAndStartAtBetweenOrderByStartAt(
        String ownerEmail, LocalDateTime from, LocalDateTime to);
    List<CalendarEvent> findByStartAtBetweenOrderByStartAt(LocalDateTime from, LocalDateTime to);

    @Query("SELECT c FROM CalendarEvent c WHERE c.startAt BETWEEN :from AND :to AND (:email IS NULL OR LOWER(c.ownerEmail) = LOWER(:email))")
    List<CalendarEvent> findByDateRangeAndOptionalOwner(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to, @Param("email") String email);
}
