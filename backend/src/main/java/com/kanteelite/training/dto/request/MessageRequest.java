package com.kanteelite.training.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class MessageRequest {

    @NotBlank(message = "Recipient email is required")
    @Email(message = "Recipient must be a valid email address")
    @Size(max = 150, message = "Recipient email must be 150 characters or less")
    private String recipientEmail;

    @NotBlank(message = "Subject is required")
    @Size(max = 200, message = "Subject must be 200 characters or less")
    private String subject;

    @NotBlank(message = "Message body is required")
    @Size(max = 5000, message = "Message body must be 5000 characters or less")
    private String body;

    private Long parentId;
    private String entityType;
    private Long entityId;
}
