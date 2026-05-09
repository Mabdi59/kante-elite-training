package com.kanteelite.training.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalTime;

@Data
@Builder
public class ScheduleRuleResponse {
    private Long id;
    private Integer dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
}
