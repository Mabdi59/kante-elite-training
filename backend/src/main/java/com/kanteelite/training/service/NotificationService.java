package com.kanteelite.training.service;

import com.kanteelite.training.dto.response.NotificationResponse;
import com.kanteelite.training.entity.Notification;
import com.kanteelite.training.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Transactional
    public void send(String userEmail, String type, String title, String body, String entity, Long entityId) {
        Notification notification = Notification.builder()
                .userEmail(userEmail.trim().toLowerCase())
                .type(type)
                .title(title)
                .body(body)
                .entity(entity)
                .entityId(entityId)
                .build();
        notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getForUser(String email) {
        return notificationRepository.findByUserEmailIgnoreCaseOrderByCreatedAtDesc(email).stream()
                .map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getUnreadForUser(String email) {
        return notificationRepository.findByUserEmailIgnoreCaseAndReadStatusFalseOrderByCreatedAtDesc(email).stream()
                .map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(String email) {
        return notificationRepository.countByUserEmailIgnoreCaseAndReadStatusFalse(email);
    }

    @Transactional
    public void markAsRead(Long id, String userEmail) {
        notificationRepository.findById(id).ifPresent(n -> {
            if (n.getUserEmail().equals(userEmail)) {
                n.setReadStatus(true);
                notificationRepository.save(n);
            }
        });
    }

    @Transactional
    public void markAllAsRead(String userEmail) {
        List<Notification> unread = notificationRepository
                .findByUserEmailIgnoreCaseAndReadStatusFalseOrderByCreatedAtDesc(userEmail);
        unread.forEach(n -> n.setReadStatus(true));
        notificationRepository.saveAll(unread);
    }

    public NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .userEmail(n.getUserEmail())
                .type(n.getType())
                .title(n.getTitle())
                .body(n.getBody())
                .readStatus(n.isReadStatus())
                .entity(n.getEntity())
                .entityId(n.getEntityId())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
