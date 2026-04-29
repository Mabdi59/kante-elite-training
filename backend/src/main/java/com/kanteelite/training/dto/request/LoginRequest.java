package com.kanteelite.training.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import com.kanteelite.training.enums.UserRole;
import lombok.Data;

@Data
public class LoginRequest {

    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String password;

    private UserRole requestedRole;

    public void setEmail(String email) {
        this.email = email == null ? null : email.trim();
    }
}
