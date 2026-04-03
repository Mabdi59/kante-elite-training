package com.kanteelite.training.dto.request;

import com.kanteelite.training.enums.ScheduleType;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ProgramEnrollmentRequest {
    private Long programId;
    private String playerEmail;
    private String playerName;
    private String parentEmail;
    private LocalDate startDate;
    private LocalDate endDate;
    private ScheduleType scheduleType = ScheduleType.ONE_TIME;
    private String notes;
}
