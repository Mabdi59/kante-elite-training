package com.kanteelite.training.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import com.kanteelite.training.enums.ProgramType;

@Entity
@Table(name = "programs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Program {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 50)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "short_description", length = 255)
    private String shortDescription;

    @Column(length = 200)
    private String location;

    @Column(name = "start_at")
    private LocalDateTime startAt;

    @Column(name = "end_at")
    private LocalDateTime endAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coach_id")
    private User coachUser;

    @Column(nullable = false)
    @Builder.Default
    private boolean recurring = false;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "program_type", length = 30)
    @Builder.Default
    private ProgramType programType = ProgramType.GROUP;

    @Column(nullable = false)
    @Builder.Default
    private Integer capacity = 20;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "UPCOMING";

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "price_label", length = 50)
    private String priceLabel;

    @Column(columnDefinition = "TEXT")
    private String features;

    @Column(length = 10)
    private String icon;

    @Column(name = "who_its_for", columnDefinition = "TEXT")
    private String whoItsFor;

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
