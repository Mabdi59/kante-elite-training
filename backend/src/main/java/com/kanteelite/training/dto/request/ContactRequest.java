package com.kanteelite.training.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ContactRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 100, message = "Name must be 100 characters or less")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    @Size(max = 150)
    private String email;

    @Size(max = 30)
    private String phone;

    @Size(max = 150)
    private String subject;

    @NotBlank(message = "Message is required")
    @Size(min = 10, max = 2000, message = "Message must be between 10 and 2000 characters")
    private String message;
}
