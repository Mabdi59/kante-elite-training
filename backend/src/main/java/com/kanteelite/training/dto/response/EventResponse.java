package com.kanteelite.training.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class EventResponse {
    private Long id;
    private String title;
    private String description;
    private String location;
    private String venue;
    private LocalDate startDate;
    private LocalDate endDate;
    private String ageGroup;
    private Integer spotsTotal;
    private Integer spotsLeft;
    private BigDecimal price;
    private String status;
    private String type;
    private String intensity;
    private Integer displayOrder;
}
