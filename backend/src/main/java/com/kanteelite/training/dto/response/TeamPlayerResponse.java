package com.kanteelite.training.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TeamPlayerResponse {
    private Long id;
    private Long teamId;
    private String fullName;
    private String jerseyNumber;
    private String position;
    private Boolean captain;
    private String notes;
    private LocalDateTime createdAt;
}
