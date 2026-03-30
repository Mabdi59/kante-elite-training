package com.kanteelite.training.dto.request;

import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TeamPlayerRequest {

    @NotBlank
    @Size(max = 150)
    private String fullName;

    @Size(max = 20)
    private String jerseyNumber;

    @Size(max = 80)
    private String position;

    private Boolean captain;

    private String notes;
}
