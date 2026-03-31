package com.kanteelite.training.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "tournaments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tournament {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, length = 200)
    private String location;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "max_teams", nullable = false)
    private Integer maxTeams;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "UPCOMING";

    @Column(name = "age_group", length = 50)
    private String ageGroup;

    @Column(name = "registration_deadline")
    private LocalDate registrationDeadline;

    @Column(name = "division", length = 100)
    private String division;

    @Column(name = "entry_fee", precision = 10, scale = 2)
    private BigDecimal entryFee;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "format_type", nullable = false, length = 30)
    @Builder.Default
    private String formatType = "ROUND_ROBIN";

    @Column(name = "group_count")
    @Builder.Default
    private Integer groupCount = 2;

    @Column(name = "teams_per_group")
    @Builder.Default
    private Integer teamsPerGroup = 4;

    @Column(name = "advance_per_group")
    @Builder.Default
    private Integer advancePerGroup = 2;

    @Column(name = "points_for_win", nullable = false)
    @Builder.Default
    private Integer pointsForWin = 3;

    @Column(name = "points_for_draw", nullable = false)
    @Builder.Default
    private Integer pointsForDraw = 1;

    @Column(name = "points_for_loss", nullable = false)
    @Builder.Default
    private Integer pointsForLoss = 0;

    @Column(name = "match_duration_minutes", nullable = false)
    @Builder.Default
    private Integer matchDurationMinutes = 50;

    @Column(name = "third_place_match_enabled", nullable = false)
    @Builder.Default
    private Boolean thirdPlaceMatchEnabled = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
