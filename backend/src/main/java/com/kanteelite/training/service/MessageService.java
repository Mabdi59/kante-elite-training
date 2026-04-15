package com.kanteelite.training.service;

import com.kanteelite.training.dto.request.MessageRequest;
import com.kanteelite.training.dto.response.MessageResponse;
import com.kanteelite.training.entity.Message;
import com.kanteelite.training.exception.ResourceNotFoundException;
import com.kanteelite.training.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;

    @Transactional
    public MessageResponse sendMessage(MessageRequest request, String senderEmail, String senderName) {
        Message parent = null;
        if (request.getParentId() != null) {
            parent = messageRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Message", request.getParentId()));
        }
        Message message = Message.builder()
                .senderEmail(senderEmail.trim().toLowerCase())
                .senderName(senderName)
                .recipientEmail(request.getRecipientEmail().trim().toLowerCase())
                .subject(request.getSubject())
                .body(request.getBody())
                .parent(parent)
                .entityType(request.getEntityType())
                .entityId(request.getEntityId())
                .build();
        return toResponse(messageRepository.save(message));
    }

    @Transactional(readOnly = true)
    public List<MessageResponse> getInbox(String email) {
        return messageRepository.findByRecipientEmailIgnoreCaseOrderByCreatedAtDesc(email).stream()
                .map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<MessageResponse> getSent(String email) {
        return messageRepository.findBySenderEmailIgnoreCaseOrderByCreatedAtDesc(email).stream()
                .map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<MessageResponse> getUnread(String email) {
        return messageRepository.findByRecipientEmailIgnoreCaseAndReadStatusFalseOrderByCreatedAtDesc(email).stream()
                .map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(String email) {
        return messageRepository.countByRecipientEmailIgnoreCaseAndReadStatusFalse(email);
    }

    @Transactional
    public MessageResponse markAsRead(Long id, String readerEmail) {
        Message message = messageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Message", id));
        if (message.getRecipientEmail().equals(readerEmail)) {
            message.setReadStatus(true);
            return toResponse(messageRepository.save(message));
        }
        return toResponse(message);
    }

    @Transactional(readOnly = true)
    public List<MessageResponse> getThread(Long parentId) {
        return messageRepository.findByParentIdOrderByCreatedAtAsc(parentId).stream()
                .map(this::toResponse).toList();
    }

    public MessageResponse toResponse(Message m) {
        return MessageResponse.builder()
                .id(m.getId())
                .senderEmail(m.getSenderEmail())
                .senderName(m.getSenderName())
                .recipientEmail(m.getRecipientEmail())
                .subject(m.getSubject())
                .body(m.getBody())
                .readStatus(m.isReadStatus())
                .parentId(m.getParent() != null ? m.getParent().getId() : null)
                .entityType(m.getEntityType())
                .entityId(m.getEntityId())
                .createdAt(m.getCreatedAt())
                .build();
    }
}
