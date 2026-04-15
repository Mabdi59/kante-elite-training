package com.kanteelite.training.dto.request;

import com.kanteelite.training.enums.AttendanceStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AttendanceRequest {

    @NotNull(message = "Booking ID is required")
    private Long bookingId;

    private String playerEmail;
    private String playerName;

    @NotNull(message = "Attendance status is required")
    private AttendanceStatus status;

    @Size(max = 1000, message = "Coach notes must be 1000 characters or less")
    private String coachNotes;
}
