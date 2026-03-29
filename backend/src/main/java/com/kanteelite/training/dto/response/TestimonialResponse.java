package com.kanteelite.training.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TestimonialResponse {
    private Long id;
    private String name;
    private String roleOrContext;
    private String quote;
    private Integer rating;
    private boolean featured;
    private Integer displayOrder;
}
