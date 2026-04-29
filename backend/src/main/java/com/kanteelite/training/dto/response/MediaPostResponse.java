package com.kanteelite.training.dto.response;

import com.kanteelite.training.enums.MediaCategory;
import com.kanteelite.training.enums.MediaType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class MediaPostResponse {
    private Long id;
    private String mediaUrl;
    private MediaType mediaType;
    private String caption;
    private String altText;
    private boolean featured;
    private boolean showOnHome;
    private boolean showOnAbout;
    private MediaCategory mediaCategory;
    private int displayOrder;
    private int homeDisplayOrder;
    private int aboutDisplayOrder;
    private LocalDateTime createdAt;
}
