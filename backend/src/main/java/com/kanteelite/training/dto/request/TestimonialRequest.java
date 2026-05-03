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

    @Size(max = 150)
    private String storyTitle;

    @NotBlank
    private String quote;

    private Long mediaPostId;

    @Size(max = 255)
    private String playerMetadata;

    @Size(max = 255)
    private String teamMetadata;

    private Long programId;

    private Long coachProfileId;

    @Min(1) @Max(5)
    private Integer rating = 5;

    private boolean featured = false;

    private boolean active = true;

    private Integer displayOrder = 0;
}
