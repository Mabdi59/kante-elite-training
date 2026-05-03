package com.kanteelite.training.dto.response;

import com.kanteelite.training.enums.MediaCategory;
import com.kanteelite.training.enums.MediaType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class MediaPostResponse {
    private Long id;
    private String mediaUrl;
    private MediaType mediaType;
    private String caption;
    private String altText;
    private MediaCategory mediaCategory;
    private List<MediaPlacementResponse> placements;
    private LocalDateTime createdAt;
}
