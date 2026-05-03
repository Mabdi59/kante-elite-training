package com.kanteelite.training.entity;

import com.kanteelite.training.enums.TrainingSessionStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "training_sessions",
        indexes = {
                @Index(name = "idx_training_sessions_program_slot", columnList = "program_id, scheduled_date, start_time"),
                @Index(name = "idx_training_sessions_coach", columnList = "coach_user_id"),
                @Index(name = "idx_training_sessions_status", columnList = "status")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrainingSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "program_id", nullable = false)
    private Program program;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id")
    private Event event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_series_id")
    private SessionSeries sessionSeries;

    @Column(name = "scheduled_date", nullable = false)
    private LocalDate scheduledDate;

    @Column(name = "start_time", nullable = false, length = 20)
    private String startTime;

    @Column(name = "end_time", length = 20)
    private String endTime;

    @Column(length = 80, nullable = false)
    @Builder.Default
    private String timezone = "America/Chicago";

    @Column(length = 200)
    private String location;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coach_user_id")
    private User coachUser;

    @Column(name = "coach_label", length = 120)
    private String coachLabel;

    @Column(nullable = false)
    @Builder.Default
    private Integer capacity = 1;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private TrainingSessionStatus status = TrainingSessionStatus.SCHEDULED;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
