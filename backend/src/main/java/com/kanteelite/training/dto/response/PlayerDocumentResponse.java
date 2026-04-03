package com.kanteelite.training.dto.response;

import com.kanteelite.training.enums.DocumentType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class PlayerDocumentResponse {
    private Long id;
    private String playerEmail;
    private String fileName;
    private String fileUrl;
    private DocumentType docType;
    private String description;
    private String uploadedBy;
    private LocalDateTime createdAt;
}
