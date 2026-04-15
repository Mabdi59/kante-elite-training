package com.kanteelite.training.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.List;

@Data
public class FamilyOnboardingRequest {

    private Long existingParentUserId;

    @Size(max = 100, message = "Parent name must be 100 characters or less")
    private String parentName;

    @Email(message = "Parent email must be a valid email address")
    @Size(max = 150, message = "Parent email must be 150 characters or less")
    private String parentEmail;

    @Size(max = 30, message = "Parent phone must be 30 characters or less")
    private String parentPhone;

    @Size(max = 50, message = "Parent role must be 50 characters or less")
    private String parentRole;

    @Size(max = 500, message = "Parent notes must be 500 characters or less")
    private String parentNotes;

    @Size(max = 200, message = "Emergency contact must be 200 characters or less")
    private String emergencyContact;

    @Size(min = 8, max = 100, message = "Password must be between 8 and 100 characters")
    private String parentPassword;

    @Valid
    private List<PlayerOnboardingEntry> players;

    @Data
    public static class PlayerOnboardingEntry {

        @NotBlank(message = "Player name is required")
        @Size(max = 100, message = "Player name must be 100 characters or less")
        private String name;

        @Size(max = 20, message = "Date of birth must be 20 characters or less")
        private String dateOfBirth;

        private Integer age;

        @Size(max = 50, message = "Skill level must be 50 characters or less")
        private String skillLevel;

        @Size(max = 50, message = "Preferred position must be 50 characters or less")
        private String preferredPosition;

        @Size(max = 500, message = "Notes must be 500 characters or less")
        private String notes;

        private Boolean active = true;
    }
}
