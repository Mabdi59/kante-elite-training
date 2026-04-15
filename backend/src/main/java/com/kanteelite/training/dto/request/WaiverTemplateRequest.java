package com.kanteelite.training.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class WaiverTemplateRequest {

    @NotBlank(message = "Waiver title is required")
    @Size(max = 200, message = "Waiver title must be 200 characters or less")
    private String title;

    @NotBlank(message = "Waiver content is required")
    private String content;

    @Size(max = 200, message = "Required roles must be 200 characters or less")
    private String requiredRoles;

    private boolean active = true;
}
