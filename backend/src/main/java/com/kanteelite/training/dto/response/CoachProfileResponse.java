package com.kanteelite.training.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.kanteelite.training.enums.MediaType;
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
    private String displayName;
    private String roleTitle;
    private String bio;
    private Long headshotMediaPostId;
    private String headshotUrl;
    private MediaType headshotMediaType;
    private String specialties;
    private String certifications;
    private String instagramUrl;
    private String websiteUrl;
    private String bookingUrl;
    private boolean featured;
    private int displayOrder;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
