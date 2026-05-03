package com.kanteelite.training.dto.request;

import com.kanteelite.training.enums.RegistrationPaymentStatus;
import com.kanteelite.training.enums.RegistrationStatus;
import com.kanteelite.training.enums.RegistrationType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class RegistrationRequest {
    private Long programId;
    private Long eventId;
    private Long trainingSessionId;
    private RegistrationType registrationType;

    private RegistrationStatus status;
    private RegistrationPaymentStatus paymentStatus;

    @NotBlank(message = "Participant name is required")
    @Size(max = 120, message = "Participant name must be 120 characters or less")
    private String participantName;

    @Size(max = 20, message = "Participant age must be 20 characters or less")
    private String participantAge;

    @Email(message = "Participant email must be valid")
    @Size(max = 150, message = "Participant email must be 150 characters or less")
    private String participantEmail;

    @Size(max = 30, message = "Participant phone must be 30 characters or less")
    private String participantPhone;

    @Size(max = 120, message = "Guardian name must be 120 characters or less")
    private String guardianName;

    @NotBlank(message = "Guardian email is required")
    @Email(message = "Guardian email must be valid")
    @Size(max = 150, message = "Guardian email must be 150 characters or less")
    private String guardianEmail;

    @Size(max = 30, message = "Guardian phone must be 30 characters or less")
    private String guardianPhone;

    @Size(max = 120, message = "Emergency contact name must be 120 characters or less")
    private String emergencyContactName;

    @Size(max = 30, message = "Emergency contact phone must be 30 characters or less")
    private String emergencyContactPhone;

    private String medicalNotes;

    @Size(max = 50, message = "Experience level must be 50 characters or less")
    private String experienceLevel;

    private LocalDate scheduledDate;

    @Size(max = 20, message = "Scheduled start time must be 20 characters or less")
    private String scheduledStartTime;

    @Size(max = 20, message = "Scheduled end time must be 20 characters or less")
    private String scheduledEndTime;

    @Size(max = 80, message = "Timezone must be 80 characters or less")
    private String timezone;

    private BigDecimal priceAmount;
    private BigDecimal amountPaid;

    @Size(max = 3, message = "Currency must be a 3-letter code")
    private String currency;

    private boolean waiverAccepted;
    private String customerNotes;
    private String adminNotes;
}
