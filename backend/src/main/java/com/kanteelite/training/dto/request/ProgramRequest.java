package com.kanteelite.training.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ProgramRequest {

    @NotBlank
    @Size(max = 100)
    private String name;

    @NotBlank
    @Size(max = 50)
    private String slug;

    private String description;

    @Size(max = 255)
    private String shortDescription;

    @Size(max = 200)
    private String location;

    private LocalDateTime startAt;

    private LocalDateTime endAt;

    private LocalDate startDate;

    private LocalDate endDate;

    private Long coachId;

    private Boolean recurring;

    @Size(max = 30)
    private String programType;

    private Integer capacity;

    @Size(max = 30)
    private String status;

    @NotNull
    @DecimalMin("0.00")
    private BigDecimal price;

    @Size(max = 50)
    private String priceLabel;

    private Integer durationMinutes;

    private String features;

    @Size(max = 10)
    private String icon;

    private String whoItsFor;

    private boolean active = true;

    private Integer displayOrder = 0;

    private List<ScheduleRuleRequest> scheduleRules;
}
