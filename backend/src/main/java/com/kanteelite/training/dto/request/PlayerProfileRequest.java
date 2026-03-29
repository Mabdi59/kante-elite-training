package com.kanteelite.training.dto.request;

import lombok.Data;

import java.time.LocalDate;

@Data
public class PlayerProfileRequest {
    private String name;
    private LocalDate dateOfBirth;
    private Integer age;
    private String skillLevel;
    private String preferredPosition;
    private String notes;
}
