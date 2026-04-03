package com.kanteelite.training.entity;

import com.kanteelite.training.enums.DocumentType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "player_documents")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PlayerDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "player_email", nullable = false, length = 150)
    private String playerEmail;

    @Column(name = "file_name", nullable = false, length = 255)
    private String fileName;

    @Column(name = "file_url", nullable = false, length = 500)
    private String fileUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "doc_type", nullable = false, length = 50)
    @Builder.Default
    private DocumentType docType = DocumentType.OTHER;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "uploaded_by", length = 150)
    private String uploadedBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
