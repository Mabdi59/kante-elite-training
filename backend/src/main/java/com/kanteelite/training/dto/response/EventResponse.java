package com.kanteelite.training.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class EventResponse {
    private Long id;
    private String title;
    private String description;
    private String location;
    private String venue;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDateTime startAt;
    private LocalDateTime endAt;
    private Integer capacity;
    private long participantCount;
    private String ageGroup;
    private Integer spotsTotal;
    private Integer spotsLeft;
    private BigDecimal price;
    private String status;
    private String type;
    private String intensity;
    private String coachName;
    private Integer displayOrder;
}
