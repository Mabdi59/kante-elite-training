package com.kanteelite.training.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ContactMessageResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String subject;
    private String message;
    private boolean readStatus;
    private LocalDateTime createdAt;
}
