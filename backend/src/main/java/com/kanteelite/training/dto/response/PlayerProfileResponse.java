package com.kanteelite.training.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PlayerProfileResponse {
    private Long id;
    private Long parentUserId;
    private String parentUserEmail;
    private String name;
    private LocalDate dateOfBirth;
    private Integer age;
    private String skillLevel;
    private String preferredPosition;
    private String notes;
    private boolean active;
    private LocalDateTime createdAt;
}
