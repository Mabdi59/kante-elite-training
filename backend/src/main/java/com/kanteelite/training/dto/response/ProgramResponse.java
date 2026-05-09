package com.kanteelite.training.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ProgramResponse {
    private Long id;
    private String name;
    private String slug;
    private String description;
    private String shortDescription;
    private String location;
    private LocalDateTime startAt;
    private LocalDateTime endAt;
    private LocalDate startDate;
    private LocalDate endDate;
    private Long coachId;
    private String coachName;
    private Boolean recurring;
    private String programType;
    private Integer capacity;
    private String status;
    private long participantCount;
    private long upcomingSessionCount;
    private BigDecimal price;
    private String priceLabel;
    private Integer durationMinutes;
    private List<String> features;
    private String icon;
    private String whoItsFor;
    private Integer displayOrder;
    private List<ScheduleRuleResponse> scheduleRules;
}
