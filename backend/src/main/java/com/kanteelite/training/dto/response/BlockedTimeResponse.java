package com.kanteelite.training.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class BlockedTimeResponse {
    private Long id;
    private Long coachId;
    private String coachName;
    private LocalDateTime startDatetime;
    private LocalDateTime endDatetime;
    private String reason;
    private LocalDateTime createdAt;
}
