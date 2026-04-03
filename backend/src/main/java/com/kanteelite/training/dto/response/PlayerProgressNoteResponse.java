package com.kanteelite.training.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class PlayerProgressNoteResponse {
    private Long id;
    private String playerEmail;
    private String playerName;
    private String coachEmail;
    private String coachName;
    private LocalDate sessionDate;
    private String noteType;
    private String title;
    private String content;
    private Integer rating;
    private boolean visibleToParent;
    private Long bookingId;
    private LocalDateTime createdAt;
}
