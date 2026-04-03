package com.kanteelite.training.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class SignedWaiverResponse {
    private Long id;
    private Long templateId;
    private String templateTitle;
    private String userEmail;
    private String userName;
    private LocalDateTime signedAt;
    private String ipAddress;
}
