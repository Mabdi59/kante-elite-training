package com.kanteelite.training.service;

import com.kanteelite.training.dto.request.SignWaiverRequest;
import com.kanteelite.training.dto.request.WaiverTemplateRequest;
import com.kanteelite.training.dto.response.PlayerDocumentResponse;
import com.kanteelite.training.dto.response.SignedWaiverResponse;
import com.kanteelite.training.dto.response.WaiverTemplateResponse;
import com.kanteelite.training.entity.PlayerDocument;
import com.kanteelite.training.entity.SignedWaiver;
import com.kanteelite.training.entity.WaiverTemplate;
import com.kanteelite.training.enums.DocumentType;
import com.kanteelite.training.exception.ResourceNotFoundException;
import com.kanteelite.training.repository.PlayerDocumentRepository;
import com.kanteelite.training.repository.SignedWaiverRepository;
import com.kanteelite.training.repository.WaiverTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WaiverService {

    private final WaiverTemplateRepository templateRepository;
    private final SignedWaiverRepository signedWaiverRepository;
    private final PlayerDocumentRepository documentRepository;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public List<WaiverTemplateResponse> getActiveTemplates() {
        return templateRepository.findByActiveTrueOrderByCreatedAtDesc().stream()
                .map(this::toTemplateResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<WaiverTemplateResponse> getAllTemplates() {
        return templateRepository.findAll().stream().map(this::toTemplateResponse).toList();
    }

    @Transactional
    public WaiverTemplateResponse createTemplate(WaiverTemplateRequest request, String actorEmail) {
        WaiverTemplate template = WaiverTemplate.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .requiredRoles(request.getRequiredRoles())
                .active(request.isActive())
                .build();
        WaiverTemplate saved = templateRepository.save(template);
        auditLogService.log(actorEmail, "CREATE", "WaiverTemplate", saved.getId(), "Created waiver: " + request.getTitle());
        return toTemplateResponse(saved);
    }

    @Transactional
    public WaiverTemplateResponse updateTemplate(Long id, WaiverTemplateRequest request, String actorEmail) {
        WaiverTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WaiverTemplate", id));
        template.setTitle(request.getTitle());
        template.setContent(request.getContent());
        template.setRequiredRoles(request.getRequiredRoles());
        template.setActive(request.isActive());
        WaiverTemplate saved = templateRepository.save(template);
        auditLogService.log(actorEmail, "UPDATE", "WaiverTemplate", id, "Updated waiver: " + request.getTitle());
        return toTemplateResponse(saved);
    }

    @Transactional
    public SignedWaiverResponse signWaiver(SignWaiverRequest request, String userEmail, String userName, String ipAddress) {
        WaiverTemplate template = templateRepository.findById(request.getTemplateId())
                .orElseThrow(() -> new ResourceNotFoundException("WaiverTemplate", request.getTemplateId()));

        if (signedWaiverRepository.existsByTemplateIdAndUserEmailIgnoreCase(request.getTemplateId(), userEmail)) {
            return signedWaiverRepository.findByTemplateIdAndUserEmailIgnoreCase(request.getTemplateId(), userEmail)
                    .map(sw -> toSignedResponse(sw, template.getTitle()))
                    .orElseThrow();
        }

        SignedWaiver signed = SignedWaiver.builder()
                .template(template)
                .userEmail(userEmail.trim().toLowerCase())
                .userName(userName)
                .ipAddress(ipAddress)
                .signature(request.getSignature())
                .build();
        SignedWaiver saved = signedWaiverRepository.save(signed);
        auditLogService.log(userEmail, "SIGN", "Waiver", template.getId(), "Signed waiver: " + template.getTitle());
        return toSignedResponse(saved, template.getTitle());
    }

    @Transactional(readOnly = true)
    public List<SignedWaiverResponse> getSignedWaiversForUser(String userEmail) {
        return signedWaiverRepository.findByUserEmailIgnoreCaseOrderBySignedAtDesc(userEmail).stream()
                .map(sw -> toSignedResponse(sw, sw.getTemplate().getTitle()))
                .toList();
    }

    @Transactional(readOnly = true)
    public boolean hasSignedWaiver(Long templateId, String userEmail) {
        return signedWaiverRepository.existsByTemplateIdAndUserEmailIgnoreCase(templateId, userEmail);
    }

    @Transactional(readOnly = true)
    public List<PlayerDocumentResponse> getDocumentsForPlayer(String playerEmail) {
        return documentRepository.findByPlayerEmailIgnoreCaseOrderByCreatedAtDesc(playerEmail).stream()
                .map(this::toDocResponse).toList();
    }

    @Transactional
    public PlayerDocumentResponse addDocument(String playerEmail, String fileName, String fileUrl,
                                               DocumentType docType, String description, String uploadedBy) {
        PlayerDocument doc = PlayerDocument.builder()
                .playerEmail(playerEmail.trim().toLowerCase())
                .fileName(fileName)
                .fileUrl(fileUrl)
                .docType(docType)
                .description(description)
                .uploadedBy(uploadedBy)
                .build();
        PlayerDocument saved = documentRepository.save(doc);
        auditLogService.log(uploadedBy, "UPLOAD", "PlayerDocument", saved.getId(), "Uploaded " + docType + ": " + fileName);
        return toDocResponse(saved);
    }

    @Transactional
    public void deleteDocument(Long id, String actorEmail) {
        PlayerDocument doc = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PlayerDocument", id));
        documentRepository.delete(doc);
        auditLogService.log(actorEmail, "DELETE", "PlayerDocument", id, "Deleted document: " + doc.getFileName());
    }

    public WaiverTemplateResponse toTemplateResponse(WaiverTemplate t) {
        return WaiverTemplateResponse.builder()
                .id(t.getId())
                .title(t.getTitle())
                .content(t.getContent())
                .requiredRoles(t.getRequiredRoles())
                .active(t.isActive())
                .createdAt(t.getCreatedAt())
                .build();
    }

    public SignedWaiverResponse toSignedResponse(SignedWaiver sw, String templateTitle) {
        return SignedWaiverResponse.builder()
                .id(sw.getId())
                .templateId(sw.getTemplate().getId())
                .templateTitle(templateTitle)
                .userEmail(sw.getUserEmail())
                .userName(sw.getUserName())
                .signedAt(sw.getSignedAt())
                .ipAddress(sw.getIpAddress())
                .build();
    }

    public PlayerDocumentResponse toDocResponse(PlayerDocument d) {
        return PlayerDocumentResponse.builder()
                .id(d.getId())
                .playerEmail(d.getPlayerEmail())
                .fileName(d.getFileName())
                .fileUrl(d.getFileUrl())
                .docType(d.getDocType())
                .description(d.getDescription())
                .uploadedBy(d.getUploadedBy())
                .createdAt(d.getCreatedAt())
                .build();
    }
}
