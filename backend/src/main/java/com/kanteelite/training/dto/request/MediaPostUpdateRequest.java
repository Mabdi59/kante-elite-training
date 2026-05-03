package com.kanteelite.training.dto.request;

import com.kanteelite.training.enums.MediaCategory;
import jakarta.validation.constraints.Size;
import jakarta.validation.Valid;
import lombok.Data;

import java.util.List;

@Data
public class MediaPostUpdateRequest {

    @Size(max = 500, message = "Caption must be 500 characters or less.")
    private String caption;

    @Size(max = 255, message = "Alt text must be 255 characters or less.")
    private String altText;

    private MediaCategory mediaCategory;

    @Valid
    private List<MediaPlacementRequest> placements;

    /**
     * When true, mediaCategory is explicitly cleared regardless of the mediaCategory field value.
     * This lets callers distinguish "omit field" from "set to null".
     */
    private boolean clearMediaCategory;
}
