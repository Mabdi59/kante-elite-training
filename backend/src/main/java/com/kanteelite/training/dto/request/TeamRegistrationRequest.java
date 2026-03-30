package com.kanteelite.training.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class TeamRegistrationRequest {

    @NotBlank
    @Size(max = 150)
    private String teamName;

    @NotBlank
    @Size(max = 100)
    private String captainName;

    @NotBlank
    @Email
    @Size(max = 150)
    private String contactEmail;

    @Size(max = 30)
    private String phone;

    @Size(max = 150)
    private String clubName;

    @NotNull
    private Long tournamentId;
}
