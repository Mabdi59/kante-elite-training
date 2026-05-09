package com.kanteelite.training.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class SessionResponse {
    private Long id;
    private String sourceType;
    private Long sourceId;
    private String sourceTitle;
    private Long coachId;
    private String coachName;
    private LocalDateTime startDatetime;
    private LocalDateTime endDatetime;
    private Integer capacity;
    private Integer registeredCount;
    private String status;
    private Integer availableSpots;
}
