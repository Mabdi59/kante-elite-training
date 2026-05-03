package com.kanteelite.training.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class RescheduleRegistrationRequest {
    @NotNull
    @Future
    private LocalDate scheduledDate;

    @NotBlank
    private String scheduledStartTime;

    private String scheduledEndTime;
}
