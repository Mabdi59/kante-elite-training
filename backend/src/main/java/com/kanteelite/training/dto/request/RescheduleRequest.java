package com.kanteelite.training.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class RescheduleRequest {
    @NotNull
    private LocalDate newDate;

    @NotNull
    private String newTime;
}
