package com.kanteelite.training.dto.request;

import com.kanteelite.training.enums.AttendanceStatus;
import lombok.Data;

@Data
public class AttendanceRequest {
    private Long bookingId;
    private String playerEmail;
    private String playerName;
    private AttendanceStatus status;
    private String coachNotes;
}
