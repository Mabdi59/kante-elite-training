package com.kanteelite.training.entity;

import com.kanteelite.training.enums.RegistrationOfferingType;
import com.kanteelite.training.enums.RegistrationPaymentStatus;
import com.kanteelite.training.enums.RegistrationSource;
import com.kanteelite.training.enums.RegistrationStatus;
import com.kanteelite.training.enums.RegistrationType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "registrations",
        indexes = {
                @Index(name = "idx_registrations_program", columnList = "program_id"),
                @Index(name = "idx_registrations_event", columnList = "event_id"),
                @Index(name = "idx_registrations_status", columnList = "status"),
                @Index(name = "idx_registrations_guardian_email", columnList = "guardian_email"),
                @Index(name = "idx_registrations_program_slot", columnList = "program_id, scheduled_date, scheduled_start_time")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Registration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "registration_code", nullable = false, unique = true, length = 32)
    private String registrationCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "offering_type", nullable = false, length = 20)
    private RegistrationOfferingType offeringType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "program_id")
    private Program program;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id")
    private Event event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "training_session_id")
    private TrainingSession trainingSession;

    @Enumerated(EnumType.STRING)
    @Column(name = "registration_type", nullable = false, length = 30)
    private RegistrationType registrationType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private RegistrationStatus status = RegistrationStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 30)
    @Builder.Default
    private RegistrationPaymentStatus paymentStatus = RegistrationPaymentStatus.UNPAID;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private RegistrationSource source = RegistrationSource.PUBLIC;

    @Column(name = "participant_name", nullable = false, length = 120)
    private String participantName;

    @Column(name = "participant_age", length = 20)
    private String participantAge;

    @Column(name = "participant_email", length = 150)
    private String participantEmail;

    @Column(name = "participant_phone", length = 30)
    private String participantPhone;

    @Column(name = "guardian_name", length = 120)
    private String guardianName;

    @Column(name = "guardian_email", nullable = false, length = 150)
    private String guardianEmail;

    @Column(name = "guardian_phone", length = 30)
    private String guardianPhone;

    @Column(name = "emergency_contact_name", length = 120)
    private String emergencyContactName;

    @Column(name = "emergency_contact_phone", length = 30)
    private String emergencyContactPhone;

    @Column(name = "medical_notes", columnDefinition = "TEXT")
    private String medicalNotes;

    @Column(name = "experience_level", length = 50)
    private String experienceLevel;

    @Column(name = "scheduled_date")
    private LocalDate scheduledDate;

    @Column(name = "scheduled_start_time", length = 20)
    private String scheduledStartTime;

    @Column(name = "scheduled_end_time", length = 20)
    private String scheduledEndTime;

    @Column(length = 80)
    @Builder.Default
    private String timezone = "America/Chicago";

    @Column(name = "price_amount", precision = 10, scale = 2)
    private BigDecimal priceAmount;

    @Column(length = 3)
    @Builder.Default
    private String currency = "USD";

    @Column(name = "amount_paid", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal amountPaid = BigDecimal.ZERO;

    @Column(name = "waiver_accepted", nullable = false)
    @Builder.Default
    private boolean waiverAccepted = false;

    @Column(name = "waiver_accepted_at")
    private LocalDateTime waiverAcceptedAt;

    @Column(name = "customer_notes", columnDefinition = "TEXT")
    private String customerNotes;

    @Column(name = "admin_notes", columnDefinition = "TEXT")
    private String adminNotes;

    @Column(name = "waitlist_position")
    private Integer waitlistPosition;

    @Column(name = "waitlisted_at")
    private LocalDateTime waitlistedAt;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "cancelled_by_type", length = 20)
    private String cancelledByType;

    @Column(name = "cancelled_by_label", length = 150)
    private String cancelledByLabel;

    @Column(name = "cancellation_reason", columnDefinition = "TEXT")
    private String cancellationReason;

    @Column(name = "confirmed_at")
    private LocalDateTime confirmedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "legacy_event_participant_id", unique = true)
    private Long legacyEventParticipantId;

    @Column(name = "legacy_program_participant_id", unique = true)
    private Long legacyProgramParticipantId;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
