package com.kanteelite.training.dto.request;

import com.kanteelite.training.enums.MediaCategory;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class MediaPostUpdateRequest {

    @Size(max = 500, message = "Caption must be 500 characters or less.")
    private String caption;

    private Boolean featured;

    private Boolean showOnHome;

    private Boolean showOnAbout;

    private MediaCategory mediaCategory;
}
