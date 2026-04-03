package com.kanteelite.training.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "player_progress_notes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PlayerProgressNote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "player_email", nullable = false, length = 150)
    private String playerEmail;

    @Column(name = "player_name", length = 100)
    private String playerName;

    @Column(name = "coach_email", nullable = false, length = 150)
    private String coachEmail;

    @Column(name = "coach_name", length = 100)
    private String coachName;

    @Column(name = "session_date", nullable = false)
    private LocalDate sessionDate;

    @Column(name = "note_type", nullable = false, length = 30)
    @Builder.Default
    private String noteType = "GENERAL";

    @Column(length = 255)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column
    private Integer rating;

    @Column(name = "visible_to_parent", nullable = false)
    @Builder.Default
    private boolean visibleToParent = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id")
    private Booking booking;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
