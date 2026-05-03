package com.kanteelite.training.entity;

import com.kanteelite.training.enums.MediaCategory;
import com.kanteelite.training.enums.MediaType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "media_posts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MediaPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "media_url", nullable = false, length = 500)
    private String mediaUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "media_type", nullable = false, length = 20)
    private MediaType mediaType;

    @Column(columnDefinition = "TEXT")
    private String caption;

    @Column(name = "alt_text", length = 255)
    private String altText;

    @Enumerated(EnumType.STRING)
    @Column(name = "media_category", length = 30)
    private MediaCategory mediaCategory;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
