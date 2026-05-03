package com.kanteelite.training.entity;

import com.kanteelite.training.enums.RegistrationPaymentStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "payment_records",
        indexes = {
                @Index(name = "idx_payment_records_registration", columnList = "registration_id"),
                @Index(name = "idx_payment_records_status", columnList = "status"),
                @Index(name = "idx_payment_records_payment_intent", columnList = "payment_intent_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "registration_id", nullable = false)
    private Registration registration;

    @Column(nullable = false, length = 40)
    @Builder.Default
    private String provider = "STRIPE";

    @Column(name = "stripe_session_id", unique = true, length = 255)
    private String stripeSessionId;

    @Column(name = "payment_intent_id", length = 255)
    private String paymentIntentId;

    @Column(precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "amount_refunded", precision = 10, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal amountRefunded = BigDecimal.ZERO;

    @Column(length = 3, nullable = false)
    @Builder.Default
    private String currency = "USD";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private RegistrationPaymentStatus status;

    @Column(name = "checkout_url", columnDefinition = "TEXT")
    private String checkoutUrl;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(name = "refunded_at")
    private LocalDateTime refundedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
