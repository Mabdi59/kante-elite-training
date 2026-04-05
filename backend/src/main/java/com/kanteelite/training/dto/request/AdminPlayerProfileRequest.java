package com.kanteelite.training.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class AdminPlayerProfileRequest {

    private Long parentUserId;

    @NotBlank
    @Size(max = 100)
    private String name;

    private LocalDate dateOfBirth;

    private Integer age;

    @Size(max = 50)
    private String skillLevel;

    @Size(max = 50)
    private String preferredPosition;

    @Size(max = 1000)
    private String notes;

    private Boolean active;
}
