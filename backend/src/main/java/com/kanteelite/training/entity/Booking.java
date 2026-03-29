package com.kanteelite.training.entity;

import com.kanteelite.training.enums.BookingStatus;
import com.kanteelite.training.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "bookings",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uq_bookings_program_date_time",
            columnNames = {"program_id", "booking_date", "booking_time"}
        )
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "program_id", nullable = false)
    private Program program;

    @Column(name = "booking_date", nullable = false)
    private LocalDate bookingDate;

    @Column(name = "booking_time", nullable = false, length = 20)
    private String bookingTime;

    @Column(name = "player_name", nullable = false, length = 100)
    private String playerName;

    @Column(name = "player_age", length = 20)
    private String playerAge;

    @Column(name = "parent_name", length = 100)
    private String parentName;

    @Column(nullable = false, length = 150)
    private String email;

    @Column(nullable = false, length = 30)
    private String phone;

    @Column(name = "experience_level", length = 50)
    private String experienceLevel;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 20)
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "booking_status", nullable = false, length = 20)
    @Builder.Default
    private BookingStatus bookingStatus = BookingStatus.RESERVED;

    @Column(name = "stripe_session_id", unique = true, length = 255)
    private String stripeSessionId;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
