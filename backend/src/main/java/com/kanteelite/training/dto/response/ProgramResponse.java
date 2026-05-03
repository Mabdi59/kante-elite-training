package com.kanteelite.training.dto.response;

import lombok.Builder;
import lombok.Data;
import com.kanteelite.training.enums.MediaType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ProgramResponse {
    private Long id;
    private String name;
    private String slug;
    private String description;
    private String shortDescription;
    private String category;
    private Long mediaPostId;
    private String mediaUrl;
    private MediaType mediaType;
    private Long secondaryMediaPostId;
    private String secondaryMediaUrl;
    private MediaType secondaryMediaType;
    private List<String> coachNames;
    private String seasonLabel;
    private String campaignLabel;
    private String location;
    private LocalDateTime startAt;
    private LocalDateTime endAt;
    private Integer capacity;
    private String status;
    private long participantCount;
    private BigDecimal price;
    private String priceLabel;
    private Integer durationMinutes;
    private List<String> features;
    private String icon;
    private String whoItsFor;
    private String ctaLabel;
    private String ctaUrl;
    private boolean featured;
    private boolean active;
    private boolean allowWaitlist;
    private Integer displayOrder;
}
