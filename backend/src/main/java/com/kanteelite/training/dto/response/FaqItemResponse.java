package com.kanteelite.training.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class FaqItemResponse {
    private Long id;
    private String question;
    private String answer;
    private String category;
    private boolean active;
    private boolean featured;
    private int displayOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
