package com.kanteelite.training.dto.response;

import com.kanteelite.training.enums.AttendanceStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class AttendanceResponse {
    private Long id;
    private Long bookingId;
    private String playerEmail;
    private String playerName;
    private AttendanceStatus status;
    private String coachNotes;
    private LocalDate sessionDate;
    private String recordedBy;
    private LocalDateTime createdAt;
}
