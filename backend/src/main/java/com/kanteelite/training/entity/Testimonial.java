package com.kanteelite.training.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "testimonials")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Testimonial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "role_or_context", length = 150)
    private String roleOrContext;

    @Column(name = "story_title", length = 150)
    private String storyTitle;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String quote;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "media_post_id")
    private MediaPost mediaPost;

    @Column(name = "player_metadata", length = 255)
    private String playerMetadata;

    @Column(name = "team_metadata", length = 255)
    private String teamMetadata;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "program_id")
    private Program program;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coach_profile_id")
    private CoachProfile coachProfile;

    @Column
    @Builder.Default
    private Integer rating = 5;

    @Column(nullable = false)
    @Builder.Default
    private boolean featured = false;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
