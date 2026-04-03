package com.kanteelite.training.repository;

import com.kanteelite.training.entity.AttendanceRecord;
import com.kanteelite.training.enums.AttendanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {
    List<AttendanceRecord> findByBookingId(Long bookingId);
    List<AttendanceRecord> findByPlayerEmailIgnoreCaseOrderBySessionDateDesc(String playerEmail);
    Optional<AttendanceRecord> findByBookingIdAndPlayerEmailIgnoreCase(Long bookingId, String playerEmail);
    List<AttendanceRecord> findBySessionDateBetweenOrderBySessionDateDesc(LocalDate from, LocalDate to);
    long countByPlayerEmailIgnoreCaseAndStatus(String playerEmail, AttendanceStatus status);

    @Query("SELECT a FROM AttendanceRecord a WHERE a.sessionDate BETWEEN :from AND :to AND (:email IS NULL OR LOWER(a.playerEmail) = LOWER(:email))")
    List<AttendanceRecord> findByDateRangeAndOptionalPlayer(@Param("from") LocalDate from, @Param("to") LocalDate to, @Param("email") String email);
}
