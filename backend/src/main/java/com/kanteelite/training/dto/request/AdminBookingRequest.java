package com.kanteelite.training.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class AdminBookingRequest {

    @NotNull(message = "Program ID is required")
    private Long programId;

    @NotNull(message = "Booking date is required")
    private LocalDate bookingDate;

    @NotBlank(message = "Booking time is required")
    private String bookingTime;

    @NotBlank(message = "Player name is required")
    @Size(max = 100, message = "Player name must be 100 characters or less")
    private String playerName;

    @Size(max = 20, message = "Player age must be 20 characters or less")
    private String playerAge;

    @Size(max = 100, message = "Parent name must be 100 characters or less")
    private String parentName;

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    @Size(max = 150, message = "Email must be 150 characters or less")
    private String email;

    @NotBlank(message = "Phone number is required")
    @Size(max = 30, message = "Phone number must be 30 characters or less")
    private String phone;

    @Size(max = 50, message = "Experience level must be 50 characters or less")
    private String experienceLevel;

    @Size(max = 1000, message = "Notes must be 1000 characters or less")
    private String notes;
}
