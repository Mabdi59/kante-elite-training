package com.kanteelite.training.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class WebsiteContentRequest {

    @Size(max = 120, message = "Home badge must be 120 characters or less.")
    private String homeBadge;

    @Size(max = 255, message = "Home headline must be 255 characters or less.")
    private String homeHeadline;

    private String homeDescription;

    @Size(max = 255, message = "Home highlights title must be 255 characters or less.")
    private String homeHighlightsTitle;

    private String homeHighlightsDescription;

    @Size(max = 120, message = "About badge must be 120 characters or less.")
    private String aboutBadge;

    @Size(max = 255, message = "About hero title must be 255 characters or less.")
    private String aboutHeroTitle;

    private String aboutHeroDescription;

    @Size(max = 255, message = "About headline must be 255 characters or less.")
    private String aboutHeadline;

    private String aboutIntro;

    private String aboutBody;

    @Size(max = 255, message = "About trust statement must be 255 characters or less.")
    private String aboutTrustStatement;

    @Size(max = 255, message = "About gallery title must be 255 characters or less.")
    private String aboutGalleryTitle;

    private String aboutGalleryDescription;

    @Size(max = 255, message = "About experience title must be 255 characters or less.")
    private String aboutExperienceTitle;

    private String aboutExperienceDescription;

    private List<String> aboutExperiencePoints;
}
