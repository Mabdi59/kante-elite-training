package com.kanteelite.training.dto.response;

import com.kanteelite.training.enums.RegistrationOfferingType;
import com.kanteelite.training.enums.RegistrationPaymentStatus;
import com.kanteelite.training.enums.RegistrationSource;
import com.kanteelite.training.enums.RegistrationStatus;
import com.kanteelite.training.enums.RegistrationType;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class RegistrationResponse {
    private Long id;
    private String registrationCode;
    private RegistrationOfferingType offeringType;
    private Long programId;
    private String programName;
    private String programSlug;
    private Long trainingSessionId;
    private String sessionCoachLabel;
    private String sessionLocation;
    private Long eventId;
    private String eventTitle;
    private RegistrationType registrationType;
    private RegistrationStatus status;
    private RegistrationPaymentStatus paymentStatus;
    private RegistrationSource source;
    private String participantName;
    private String participantAge;
    private String participantEmail;
    private String participantPhone;
    private String guardianName;
    private String guardianEmail;
    private String guardianPhone;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String medicalNotes;
    private String experienceLevel;
    private LocalDate scheduledDate;
    private String scheduledStartTime;
    private String scheduledEndTime;
    private String timezone;
    private BigDecimal priceAmount;
    private String currency;
    private BigDecimal amountPaid;
    private boolean waiverAccepted;
    private String customerNotes;
    private String adminNotes;
    private Integer waitlistPosition;
    private LocalDateTime waitlistedAt;
    private LocalDateTime cancelledAt;
    private String cancelledByType;
    private String cancelledByLabel;
    private String cancellationReason;
    private LocalDateTime confirmedAt;
    private LocalDateTime completedAt;
    private Long paymentRecordId;
    private String paymentProvider;
    private String stripeSessionId;
    private String paymentIntentId;
    private BigDecimal paymentAmount;
    private BigDecimal amountRefunded;
    private boolean paymentRefundable;
    private boolean confirmationEmailAvailable;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<RegistrationHistoryResponse> history;
}
