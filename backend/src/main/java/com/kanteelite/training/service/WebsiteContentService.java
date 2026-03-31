package com.kanteelite.training.service;

import com.kanteelite.training.dto.request.WebsiteContentRequest;
import com.kanteelite.training.dto.response.WebsiteContentResponse;
import com.kanteelite.training.entity.WebsiteContent;
import com.kanteelite.training.repository.WebsiteContentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WebsiteContentService {

    private final WebsiteContentRepository websiteContentRepository;

    @Transactional
    public WebsiteContentResponse getPublicContent() {
        return toResponse(getOrCreateContent());
    }

    @Transactional
    public WebsiteContentResponse getAdminContent() {
        return toResponse(getOrCreateContent());
    }

    @Transactional
    public WebsiteContentResponse updateContent(WebsiteContentRequest request) {
        WebsiteContent content = getOrCreateContent();

        content.setHomeBadge(clean(request.getHomeBadge()));
        content.setHomeHeadline(clean(request.getHomeHeadline()));
        content.setHomeDescription(clean(request.getHomeDescription()));
        content.setHomeHighlightsTitle(clean(request.getHomeHighlightsTitle()));
        content.setHomeHighlightsDescription(clean(request.getHomeHighlightsDescription()));
        content.setAboutBadge(clean(request.getAboutBadge()));
        content.setAboutHeroTitle(clean(request.getAboutHeroTitle()));
        content.setAboutHeroDescription(clean(request.getAboutHeroDescription()));
        content.setAboutHeadline(clean(request.getAboutHeadline()));
        content.setAboutIntro(clean(request.getAboutIntro()));
        content.setAboutBody(clean(request.getAboutBody()));
        content.setAboutTrustStatement(clean(request.getAboutTrustStatement()));
        content.setAboutGalleryTitle(clean(request.getAboutGalleryTitle()));
        content.setAboutGalleryDescription(clean(request.getAboutGalleryDescription()));
        content.setAboutExperienceTitle(clean(request.getAboutExperienceTitle()));
        content.setAboutExperienceDescription(clean(request.getAboutExperienceDescription()));
        content.setAboutExperiencePoints(joinLines(request.getAboutExperiencePoints()));

        return toResponse(websiteContentRepository.save(content));
    }

    private WebsiteContent getOrCreateContent() {
        return websiteContentRepository.findTopByOrderByIdAsc()
                .orElseGet(() -> websiteContentRepository.save(defaultContent()));
    }

    private WebsiteContent defaultContent() {
        return WebsiteContent.builder()
                .homeBadge("Columbus youth soccer training")
                .homeHeadline("Train Like an Elite Player.")
                .homeDescription("Private and small group soccer training for Columbus players ages 8 to 18. Every player gets focused coaching, a clear plan, and progress you can see.")
                .homeHighlightsTitle("Latest Highlights")
                .homeHighlightsDescription("Fresh photos and videos from sessions, events, and the work players put in every week.")
                .aboutBadge("About")
                .aboutHeroTitle("Mohamed Sheik Kante")
                .aboutHeroDescription("Founder and Head Coach. Known as Coach Kante.")
                .aboutHeadline("Built on real playing experience and high level competition")
                .aboutIntro("Training built from national team, college, and high level competition experience.")
                .aboutBody("Sessions are direct, performance focused, and built to help players improve with purpose.")
                .aboutTrustStatement("Trusted by players and families across Columbus.")
                .aboutGalleryTitle("Inside the Work")
                .aboutGalleryDescription("A look at the sessions, the standards, and the work behind every week of training.")
                .aboutExperienceTitle("Coaching and Playing Experience")
                .aboutExperienceDescription("Real experience that shapes every session.")
                .aboutExperiencePoints(joinLines(List.of(
                        "Somalia National Team player",
                        "Ohio Dominican University captain and starter",
                        "All-Conference honors and Player of the Week",
                        "Experience in USL2 and UPSL level competition",
                        "Years of competitive and high level training"
                )))
                .build();
    }

    private WebsiteContentResponse toResponse(WebsiteContent content) {
        return WebsiteContentResponse.builder()
                .id(content.getId())
                .homeBadge(content.getHomeBadge())
                .homeHeadline(content.getHomeHeadline())
                .homeDescription(content.getHomeDescription())
                .homeHighlightsTitle(content.getHomeHighlightsTitle())
                .homeHighlightsDescription(content.getHomeHighlightsDescription())
                .aboutBadge(content.getAboutBadge())
                .aboutHeroTitle(content.getAboutHeroTitle())
                .aboutHeroDescription(content.getAboutHeroDescription())
                .aboutHeadline(content.getAboutHeadline())
                .aboutIntro(content.getAboutIntro())
                .aboutBody(content.getAboutBody())
                .aboutTrustStatement(content.getAboutTrustStatement())
                .aboutGalleryTitle(content.getAboutGalleryTitle())
                .aboutGalleryDescription(content.getAboutGalleryDescription())
                .aboutExperienceTitle(content.getAboutExperienceTitle())
                .aboutExperienceDescription(content.getAboutExperienceDescription())
                .aboutExperiencePoints(splitLines(content.getAboutExperiencePoints()))
                .createdAt(content.getCreatedAt())
                .updatedAt(content.getUpdatedAt())
                .build();
    }

    private String clean(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }

    private String joinLines(List<String> lines) {
        if (lines == null || lines.isEmpty()) {
            return null;
        }

        return lines.stream()
                .map(this::clean)
                .filter(StringUtils::hasText)
                .reduce((left, right) -> left + "\n" + right)
                .orElse(null);
    }

    private List<String> splitLines(String raw) {
        if (!StringUtils.hasText(raw)) {
            return List.of();
        }

        return Arrays.stream(raw.split("\\R"))
                .map(String::trim)
                .filter(StringUtils::hasText)
                .toList();
    }
}
