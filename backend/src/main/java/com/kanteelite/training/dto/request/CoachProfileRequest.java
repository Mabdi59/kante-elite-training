package com.kanteelite.training.dto.request;

import lombok.Data;

@Data
public class CoachProfileRequest {
    private String bio;
    private String specialties;
    private String certifications;
    private boolean active = true;
}
