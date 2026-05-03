package com.kanteelite.training.dto.response;

import com.kanteelite.training.enums.MediaPlacementKey;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MediaPlacementResponse {
    private MediaPlacementKey key;
    private int displayOrder;
}
