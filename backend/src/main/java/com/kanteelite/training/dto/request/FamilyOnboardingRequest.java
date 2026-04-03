package com.kanteelite.training.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class FamilyOnboardingRequest {

    private Long existingParentUserId;

    private String parentName;
    private String parentEmail;
    private String parentPhone;
    private String parentRole;
    private String parentNotes;
    private String emergencyContact;
    private String parentPassword;

    private List<PlayerOnboardingEntry> players;

    @Data
    public static class PlayerOnboardingEntry {
        private String name;
        private String dateOfBirth;
        private Integer age;
        private String skillLevel;
        private String preferredPosition;
        private String notes;
        private Boolean active = true;
    }
}
