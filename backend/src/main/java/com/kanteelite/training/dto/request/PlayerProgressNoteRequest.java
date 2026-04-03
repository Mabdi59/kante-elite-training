package com.kanteelite.training.dto.request;

import lombok.Data;
import java.time.LocalDate;

@Data
public class PlayerProgressNoteRequest {
    private String playerEmail;
    private String playerName;
    private LocalDate sessionDate;
    private String noteType;
    private String title;
    private String content;
    private Integer rating;
    private boolean visibleToParent = true;
    private Long bookingId;
}
