package com.kanteelite.training.dto.request;

import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CoachProfileRequest {
    @Size(max = 120, message = "Name must be 120 characters or less.")
    private String displayName;

    @Size(max = 120, message = "Role title must be 120 characters or less.")
    private String roleTitle;

    @Size(max = 1600, message = "Bio must be 1600 characters or less.")
    private String bio;

    private Long headshotMediaPostId;

    @Size(max = 500, message = "Specialties must be 500 characters or less.")
    private String specialties;

    @Size(max = 500, message = "Certifications must be 500 characters or less.")
    private String certifications;

    @Size(max = 500, message = "Instagram URL must be 500 characters or less.")
    private String instagramUrl;

    @Size(max = 500, message = "Website URL must be 500 characters or less.")
    private String websiteUrl;

    @Size(max = 500, message = "Booking URL must be 500 characters or less.")
    private String bookingUrl;

    private boolean featured = false;

    @PositiveOrZero(message = "Display order must be zero or greater.")
    private Integer displayOrder = 0;

    private boolean active = true;
}
