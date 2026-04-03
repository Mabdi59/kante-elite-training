package com.kanteelite.training.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class WaiverTemplateResponse {
    private Long id;
    private String title;
    private String content;
    private String requiredRoles;
    private boolean active;
    private LocalDateTime createdAt;
}
