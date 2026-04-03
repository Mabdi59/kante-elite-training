package com.kanteelite.training.dto.response;

import com.kanteelite.training.enums.EnrollmentStatus;
import com.kanteelite.training.enums.PaymentStatus;
import com.kanteelite.training.enums.ScheduleType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class ProgramEnrollmentResponse {
    private Long id;
    private Long programId;
    private String programName;
    private String playerEmail;
    private String playerName;
    private String parentEmail;
    private LocalDate startDate;
    private LocalDate endDate;
    private EnrollmentStatus status;
    private ScheduleType scheduleType;
    private PaymentStatus paymentStatus;
    private String notes;
    private String enrolledBy;
    private LocalDateTime createdAt;
}
