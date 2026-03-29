package com.kanteelite.training.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class TestimonialRequest {

    @NotBlank
    @Size(max = 100)
    private String name;

    @Size(max = 150)
    private String roleOrContext;

    @NotBlank
    private String quote;

    @Min(1) @Max(5)
    private Integer rating = 5;

    private boolean featured = false;

    private Integer displayOrder = 0;
}
