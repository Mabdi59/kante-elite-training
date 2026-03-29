package com.kanteelite.training.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CoachProfileResponse {
    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private String bio;
    private String specialties;
    private String certifications;
    private boolean active;
    private LocalDateTime createdAt;
}
