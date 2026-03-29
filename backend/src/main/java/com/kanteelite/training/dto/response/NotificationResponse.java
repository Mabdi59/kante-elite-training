package com.kanteelite.training.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class NotificationResponse {
    private Long id;
    private String userEmail;
    private String type;
    private String title;
    private String body;
    private boolean readStatus;
    private String entity;
    private Long entityId;
    private LocalDateTime createdAt;
}
