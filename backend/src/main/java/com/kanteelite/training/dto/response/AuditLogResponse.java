package com.kanteelite.training.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuditLogResponse {
    private Long id;
    private String userEmail;
    private String action;
    private String entity;
    private Long entityId;
    private String details;
    private LocalDateTime createdAt;
}
