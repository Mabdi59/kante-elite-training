package com.kanteelite.training.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Minimal registration request - just name and email, nothing else.
 * This is for direct, instant event registration without extra friction.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SimpleEventRegistrationRequest {

    @NotBlank(message = "Name is required")
    @Size(min = 1, max = 100, message = "Name must be between 1 and 100 characters")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    @Size(max = 150, message = "Email must not exceed 150 characters")
    private String email;

    @Size(max = 40, message = "Phone must not exceed 40 characters")
    private String phone;

    @Size(max = 40, message = "Player age must not exceed 40 characters")
    private String playerAge;

    private String packageType;

    private List<Long> trainingSessionIds;
}
