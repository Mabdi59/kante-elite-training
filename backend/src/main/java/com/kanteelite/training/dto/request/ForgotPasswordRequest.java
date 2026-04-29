package com.kanteelite.training.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ForgotPasswordRequest {
    @NotBlank
    @Email
    private String email;

    public void setEmail(String email) {
        this.email = email == null ? null : email.trim();
    }
}
