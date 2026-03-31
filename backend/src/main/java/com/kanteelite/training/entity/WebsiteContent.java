package com.kanteelite.training.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "website_content")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WebsiteContent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "home_badge", length = 120)
    private String homeBadge;

    @Column(name = "home_headline", length = 255)
    private String homeHeadline;

    @Column(name = "home_description", columnDefinition = "TEXT")
    private String homeDescription;

    @Column(name = "home_highlights_title", length = 255)
    private String homeHighlightsTitle;

    @Column(name = "home_highlights_description", columnDefinition = "TEXT")
    private String homeHighlightsDescription;

    @Column(name = "about_badge", length = 120)
    private String aboutBadge;

    @Column(name = "about_hero_title", length = 255)
    private String aboutHeroTitle;

    @Column(name = "about_hero_description", columnDefinition = "TEXT")
    private String aboutHeroDescription;

    @Column(name = "about_headline", length = 255)
    private String aboutHeadline;

    @Column(name = "about_intro", columnDefinition = "TEXT")
    private String aboutIntro;

    @Column(name = "about_body", columnDefinition = "TEXT")
    private String aboutBody;

    @Column(name = "about_trust_statement", length = 255)
    private String aboutTrustStatement;

    @Column(name = "about_gallery_title", length = 255)
    private String aboutGalleryTitle;

    @Column(name = "about_gallery_description", columnDefinition = "TEXT")
    private String aboutGalleryDescription;

    @Column(name = "about_experience_title", length = 255)
    private String aboutExperienceTitle;

    @Column(name = "about_experience_description", columnDefinition = "TEXT")
    private String aboutExperienceDescription;

    @Column(name = "about_experience_points", columnDefinition = "TEXT")
    private String aboutExperiencePoints;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
