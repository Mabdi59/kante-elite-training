package com.kanteelite.training.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class EventRequest {

    @NotBlank
    @Size(max = 150)
    private String title;

    private String description;

    @NotBlank
    @Size(max = 200)
    private String location;

    @NotBlank
    private String venue;

    @NotNull
    private LocalDate startDate;

    private LocalDate endDate;

    private LocalDateTime startAt;

    private LocalDateTime endAt;

    private Integer capacity;

    @Size(max = 50)
    private String ageGroup;

    private Integer spotsTotal;

    private Integer spotsLeft;

    @NotNull
    @DecimalMin("0.00")
    private BigDecimal price;

    @Size(max = 50)
    private String status;

    @Size(max = 50)
    private String type;

    @Size(max = 50)
    private String intensity;

    @Size(max = 100)
    private String coachName;

    @Size(max = 500)
    private String primaryMediaUrl;

    @Size(max = 500)
    private String secondaryMediaUrl;

    private boolean featured = false;

    private boolean active = true;

    private boolean allowWaitlist = true;

    private Integer displayOrder = 0;
}
