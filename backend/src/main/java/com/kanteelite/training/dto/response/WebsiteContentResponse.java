package com.kanteelite.training.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class WebsiteContentResponse {
    private Long id;
    private String homeBadge;
    private String homeHeadline;
    private String homeDescription;
    private String homeHighlightsTitle;
    private String homeHighlightsDescription;
    private String aboutBadge;
    private String aboutHeroTitle;
    private String aboutHeroDescription;
    private String aboutHeadline;
    private String aboutIntro;
    private String aboutBody;
    private String aboutTrustStatement;
    private String aboutGalleryTitle;
    private String aboutGalleryDescription;
    private String aboutExperienceTitle;
    private String aboutExperienceDescription;
    private List<String> aboutExperiencePoints;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
