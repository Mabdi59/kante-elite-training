package com.kanteelite.training.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class PlayerProfileRequest {

    @NotBlank(message = "Player name is required")
    @Size(max = 100, message = "Player name must be 100 characters or less")
    private String name;

    private LocalDate dateOfBirth;

    private Integer age;

    @Size(max = 50, message = "Skill level must be 50 characters or less")
    private String skillLevel;

    @Size(max = 50, message = "Preferred position must be 50 characters or less")
    private String preferredPosition;

    @Size(max = 500, message = "Notes must be 500 characters or less")
    private String notes;
}
