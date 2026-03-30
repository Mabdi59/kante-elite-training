package com.kanteelite.training.entity;

import com.kanteelite.training.enums.PaymentStatus;
import com.kanteelite.training.enums.TeamRegistrationStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "team_registrations",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_team_tournament", columnNames = {"tournament_id", "team_id"})
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamRegistration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tournament_id", nullable = false)
    private Tournament tournament;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private TeamRegistrationStatus status = TeamRegistrationStatus.PENDING;

    @Column(name = "guest_access_token", nullable = false, unique = true, length = 64)
    private String guestAccessToken;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 20)
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Column(name = "payment_method", length = 50)
    private String paymentMethod;

    @Column(name = "payment_reference", length = 255)
    private String paymentReference;

    @Column(name = "payment_notes", columnDefinition = "TEXT")
    private String paymentNotes;

    @Column(name = "payment_session_id", length = 255)
    private String paymentSessionId;

    @Column(name = "payment_submitted_at")
    private LocalDateTime paymentSubmittedAt;

    @Column(name = "payment_paid_at")
    private LocalDateTime paymentPaidAt;

    @Column(name = "confirmation_email_sent_at")
    private LocalDateTime confirmationEmailSentAt;

    @Column(name = "status_email_sent_at")
    private LocalDateTime statusEmailSentAt;

    @Column(name = "payment_reminder_sent_at")
    private LocalDateTime paymentReminderSentAt;

    @Column(name = "roster_reminder_sent_at")
    private LocalDateTime rosterReminderSentAt;

    @Column(name = "last_follow_up_sent_at")
    private LocalDateTime lastFollowUpSentAt;

    @Column(name = "roster_text", columnDefinition = "TEXT")
    private String rosterText;

    @Column(name = "roster_file_name", length = 255)
    private String rosterFileName;

    @Column(name = "roster_file_path", length = 500)
    private String rosterFilePath;

    @Column(name = "roster_file_type", length = 150)
    private String rosterFileType;

    @Column(name = "roster_submitted_at")
    private LocalDateTime rosterSubmittedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
