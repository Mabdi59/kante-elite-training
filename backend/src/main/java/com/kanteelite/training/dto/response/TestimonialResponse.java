package com.kanteelite.training.dto.response;

import com.kanteelite.training.enums.MediaType;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TestimonialResponse {
    private Long id;
    private String name;
    private String roleOrContext;
    private String storyTitle;
    private String quote;
    private Long mediaPostId;
    private String mediaUrl;
    private MediaType mediaType;
    private String playerMetadata;
    private String teamMetadata;
    private Long programId;
    private String programName;
    private Long coachProfileId;
    private String coachName;
    private Integer rating;
    private boolean featured;
    private boolean active;
    private Integer displayOrder;
}
