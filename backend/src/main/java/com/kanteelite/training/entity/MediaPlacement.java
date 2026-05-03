package com.kanteelite.training.entity;

import com.kanteelite.training.enums.MediaPlacementKey;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "media_placements",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_media_placements_post_key",
                columnNames = {"media_post_id", "placement_key"}
        )
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MediaPlacement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "media_post_id", nullable = false)
    private MediaPost mediaPost;

    @Enumerated(EnumType.STRING)
    @Column(name = "placement_key", nullable = false, length = 40)
    private MediaPlacementKey placementKey;

    @Builder.Default
    @Column(name = "display_order", nullable = false)
    private int displayOrder = 0;
}
