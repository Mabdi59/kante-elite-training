package com.kanteelite.training.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ProgramRequest {

    @NotBlank
    @Size(max = 100)
    private String name;

    @NotBlank
    @Size(max = 50)
    private String slug;

    private String description;

    @Size(max = 255)
    private String shortDescription;

    @Size(max = 80)
    private String category;

    private Long mediaPostId;

    private Long secondaryMediaPostId;

    private String coachNames;

    @Size(max = 80)
    private String seasonLabel;

    @Size(max = 120)
    private String campaignLabel;

    @Size(max = 200)
    private String location;

    private LocalDateTime startAt;

    private LocalDateTime endAt;

    private Integer capacity;

    @Size(max = 30)
    private String status;

    @NotNull
    @DecimalMin("0.00")
    private BigDecimal price;

    @Size(max = 50)
    private String priceLabel;

    private Integer durationMinutes;

    private String features;

    @Size(max = 10)
    private String icon;

    private String whoItsFor;

    @Size(max = 80)
    private String ctaLabel;

    @Size(max = 500)
    private String ctaUrl;

    private boolean featured = false;

    private boolean active = true;

    private boolean allowWaitlist = true;

    private Integer displayOrder = 0;
}
