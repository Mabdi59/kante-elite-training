package com.kanteelite.training.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class ProgramResponse {
    private Long id;
    private String name;
    private String slug;
    private String description;
    private String shortDescription;
    private BigDecimal price;
    private String priceLabel;
    private Integer durationMinutes;
    private List<String> features;
    private String icon;
    private String whoItsFor;
    private Integer displayOrder;
}
