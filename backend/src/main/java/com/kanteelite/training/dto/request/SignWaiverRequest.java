package com.kanteelite.training.dto.request;

import lombok.Data;

@Data
public class SignWaiverRequest {
    private Long templateId;
    private String signature;
}
