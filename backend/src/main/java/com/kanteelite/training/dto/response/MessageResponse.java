package com.kanteelite.training.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class MessageResponse {
    private Long id;
    private String senderEmail;
    private String senderName;
    private String recipientEmail;
    private String subject;
    private String body;
    private boolean readStatus;
    private Long parentId;
    private String entityType;
    private Long entityId;
    private LocalDateTime createdAt;
}
