package com.kanteelite.training.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalTime;

@Data
public class ScheduleRuleRequest {

    /** 0 = Sunday, 1 = Monday, ..., 6 = Saturday */
    @NotNull
    @Min(0)
    @Max(6)
    private Integer dayOfWeek;

    @NotNull
    private LocalTime startTime;

    @NotNull
    private LocalTime endTime;
}
