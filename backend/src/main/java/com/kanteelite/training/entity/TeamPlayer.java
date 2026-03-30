package com.kanteelite.training.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "team_players")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamPlayer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    @Column(name = "full_name", nullable = false, length = 150)
    private String fullName;

    @Column(name = "jersey_number", length = 20)
    private String jerseyNumber;

    @Column(length = 80)
    private String position;

    @Column(nullable = false)
    @Builder.Default
    private Boolean captain = false;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
