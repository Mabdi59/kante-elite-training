package com.kanteelite.training.service;

import com.kanteelite.training.entity.AuditLog;
import com.kanteelite.training.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(String userEmail, String action, String entity, Long entityId, String details) {
        AuditLog entry = AuditLog.builder()
                .userEmail(userEmail)
                .action(action)
                .entity(entity)
                .entityId(entityId)
                .details(details)
                .build();
        auditLogRepository.save(entry);
    }

    @Transactional(readOnly = true)
    public List<AuditLog> getRecent() {
        return auditLogRepository.findTop100ByOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public List<AuditLog> getForEntity(String entity, Long entityId) {
        return auditLogRepository.findByEntityAndEntityIdOrderByCreatedAtDesc(entity, entityId);
    }
}
