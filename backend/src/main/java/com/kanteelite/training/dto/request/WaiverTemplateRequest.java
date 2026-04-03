package com.kanteelite.training.dto.request;

import lombok.Data;

@Data
public class WaiverTemplateRequest {
    private String title;
    private String content;
    private String requiredRoles;
    private boolean active = true;
}
