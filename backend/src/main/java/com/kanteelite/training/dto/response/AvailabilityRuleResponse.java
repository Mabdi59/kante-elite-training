package com.kanteelite.training.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalTime;
import java.time.LocalDateTime;

@Data
@Builder
public class AvailabilityRuleResponse {
    private Long id;
    private Long coachId;
    private String coachName;
    private Integer dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private boolean active;
    private String timezone;
    private LocalDateTime createdAt;
}
