package com.kanteelite.training.dto.request;

import com.kanteelite.training.enums.MediaPlacementKey;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

@Data
public class MediaPlacementRequest {

    @NotNull(message = "Placement is required.")
    private MediaPlacementKey key;

    @PositiveOrZero(message = "Display order must be zero or greater.")
    private Integer displayOrder;
}
