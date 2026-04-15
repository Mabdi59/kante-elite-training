package com.kanteelite.training.dto.request;

import com.kanteelite.training.enums.ScheduleType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ProgramEnrollmentRequest {

    @NotNull(message = "Program ID is required")
    private Long programId;

    @Email(message = "Player email must be a valid email address")
    @Size(max = 150, message = "Player email must be 150 characters or less")
    private String playerEmail;

    @Size(max = 100, message = "Player name must be 100 characters or less")
    private String playerName;

    @Email(message = "Parent email must be a valid email address")
    @Size(max = 150, message = "Parent email must be 150 characters or less")
    private String parentEmail;

    private LocalDate startDate;
    private LocalDate endDate;
    private ScheduleType scheduleType = ScheduleType.ONE_TIME;

    @Size(max = 500, message = "Notes must be 500 characters or less")
    private String notes;
}
