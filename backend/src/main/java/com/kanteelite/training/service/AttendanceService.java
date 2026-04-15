package com.kanteelite.training.service;

import com.kanteelite.training.dto.request.AttendanceRequest;
import com.kanteelite.training.dto.response.AttendanceResponse;
import com.kanteelite.training.entity.AttendanceRecord;
import com.kanteelite.training.entity.Booking;
import com.kanteelite.training.enums.AttendanceStatus;
import com.kanteelite.training.exception.ResourceNotFoundException;
import com.kanteelite.training.repository.AttendanceRecordRepository;
import com.kanteelite.training.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRecordRepository attendanceRepository;
    private final BookingRepository bookingRepository;
    private final AuditLogService auditLogService;
    private final EmailService emailService;

    @Transactional
    public AttendanceResponse upsertAttendance(AttendanceRequest request, String recordedBy) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking", request.getBookingId()));

        AttendanceRecord record = attendanceRepository
                .findByBookingIdAndPlayerEmailIgnoreCase(request.getBookingId(), request.getPlayerEmail())
                .orElseGet(() -> AttendanceRecord.builder()
                        .booking(booking)
                        .playerEmail(request.getPlayerEmail().trim().toLowerCase())
                        .playerName(request.getPlayerName())
                        .sessionDate(booking.getBookingDate())
                        .build());

        record.setStatus(request.getStatus());
        record.setCoachNotes(request.getCoachNotes());
        record.setRecordedBy(recordedBy);

        AttendanceRecord saved = attendanceRepository.save(record);
        auditLogService.log(recordedBy, "UPSERT", "AttendanceRecord", saved.getId(),
                "Attendance " + request.getStatus() + " for " + request.getPlayerEmail());

        // Notify player by email
        emailService.sendAttendanceMarkedEmail(
                request.getPlayerEmail().trim().toLowerCase(),
                request.getPlayerName() != null ? request.getPlayerName() : request.getPlayerEmail(),
                booking.getBookingDate() != null ? booking.getBookingDate().toString() : "",
                request.getStatus() != null ? request.getStatus().name() : "",
                request.getCoachNotes()
        );

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<AttendanceResponse> getByBookingId(Long bookingId) {
        return attendanceRepository.findByBookingId(bookingId).stream()
                .map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<AttendanceResponse> getByPlayerEmail(String playerEmail) {
        return attendanceRepository.findByPlayerEmailIgnoreCaseOrderBySessionDateDesc(playerEmail).stream()
                .map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<AttendanceResponse> getByDateRange(LocalDate from, LocalDate to, String playerEmail) {
        return attendanceRepository.findByDateRangeAndOptionalPlayer(from, to, playerEmail).stream()
                .map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public Map<String, Long> getAttendanceSummaryForPlayer(String playerEmail) {
        long present = attendanceRepository.countByPlayerEmailIgnoreCaseAndStatus(playerEmail, AttendanceStatus.PRESENT);
        long absent = attendanceRepository.countByPlayerEmailIgnoreCaseAndStatus(playerEmail, AttendanceStatus.ABSENT);
        long late = attendanceRepository.countByPlayerEmailIgnoreCaseAndStatus(playerEmail, AttendanceStatus.LATE);
        return Map.of("PRESENT", present, "ABSENT", absent, "LATE", late, "TOTAL", present + absent + late);
    }

    @Transactional
    public void deleteAttendance(Long id, String actorEmail) {
        AttendanceRecord record = attendanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AttendanceRecord", id));
        attendanceRepository.delete(record);
        auditLogService.log(actorEmail, "DELETE", "AttendanceRecord", id,
                "Deleted attendance for " + record.getPlayerEmail() + " on " + record.getSessionDate());
    }

    public AttendanceResponse toResponse(AttendanceRecord r) {
        return AttendanceResponse.builder()
                .id(r.getId())
                .bookingId(r.getBooking().getId())
                .playerEmail(r.getPlayerEmail())
                .playerName(r.getPlayerName())
                .status(r.getStatus())
                .coachNotes(r.getCoachNotes())
                .sessionDate(r.getSessionDate())
                .recordedBy(r.getRecordedBy())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
