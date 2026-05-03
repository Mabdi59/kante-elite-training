package com.kanteelite.training.entity;

import com.kanteelite.training.enums.RegistrationActorType;
import com.kanteelite.training.enums.RegistrationPaymentStatus;
import com.kanteelite.training.enums.RegistrationStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "registration_history", indexes = {
        @Index(name = "idx_registration_history_registration", columnList = "registration_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegistrationHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "registration_id", nullable = false)
    private Registration registration;

    @Column(name = "event_type", nullable = false, length = 50)
    private String eventType;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(name = "previous_status", length = 20)
    private RegistrationStatus previousStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_status", length = 20)
    private RegistrationStatus newStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "previous_payment_status", length = 30)
    private RegistrationPaymentStatus previousPaymentStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_payment_status", length = 30)
    private RegistrationPaymentStatus newPaymentStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "actor_type", nullable = false, length = 20)
    private RegistrationActorType actorType;

    @Column(name = "actor_label", length = 150)
    private String actorLabel;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
