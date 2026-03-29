package com.kanteelite.training.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CheckoutRequest {

    @NotNull(message = "Program ID is required")
    private Long programId;

    @NotNull(message = "Booking date is required")
    @Future(message = "Booking date must be in the future")
    private LocalDate bookingDate;

    @NotBlank(message = "Booking time is required")
    private String bookingTime;

    @NotBlank(message = "Player name is required")
    @Size(max = 100)
    private String playerName;

    @Size(max = 20)
    private String playerAge;

    @Size(max = 100)
    private String parentName;

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    private String email;

    @NotBlank(message = "Phone number is required")
    @Size(max = 30)
    private String phone;

    @Size(max = 50)
    private String experienceLevel;

    @Size(max = 1000)
    private String notes;
}
