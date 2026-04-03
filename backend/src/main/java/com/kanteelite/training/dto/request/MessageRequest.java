package com.kanteelite.training.dto.request;

import lombok.Data;

@Data
public class MessageRequest {
    private String recipientEmail;
    private String subject;
    private String body;
    private Long parentId;
    private String entityType;
    private Long entityId;
}
