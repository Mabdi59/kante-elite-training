package com.kanteelite.training.dto.request;

import com.kanteelite.training.enums.MediaCategory;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class MediaPostUpdateRequest {

    @Size(max = 500, message = "Caption must be 500 characters or less.")
    private String caption;

    @Size(max = 255, message = "Alt text must be 255 characters or less.")
    private String altText;

    private Boolean featured;

    private Boolean showOnHome;

    private Boolean showOnAbout;

    private MediaCategory mediaCategory;

    @PositiveOrZero(message = "Display order must be zero or greater.")
    private Integer displayOrder;

    @PositiveOrZero(message = "Home display order must be zero or greater.")
    private Integer homeDisplayOrder;

    @PositiveOrZero(message = "About display order must be zero or greater.")
    private Integer aboutDisplayOrder;

    /**
     * When true, mediaCategory is explicitly cleared regardless of the mediaCategory field value.
     * This lets callers distinguish "omit field" from "set to null".
     */
    private boolean clearMediaCategory;
}
