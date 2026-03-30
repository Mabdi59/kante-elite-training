package com.kanteelite.training.service;

import com.kanteelite.training.dto.request.ContactRequest;
import com.kanteelite.training.dto.response.ContactMessageResponse;
import com.kanteelite.training.entity.ContactMessage;
import com.kanteelite.training.exception.ResourceNotFoundException;
import com.kanteelite.training.repository.ContactMessageRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ContactService {

    private static final Logger log = LoggerFactory.getLogger(ContactService.class);

    private final ContactMessageRepository contactMessageRepository;
    private final EmailService emailService;

    public void submitContactMessage(ContactRequest request) {
        ContactMessage message = ContactMessage.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .subject(request.getSubject())
                .message(request.getMessage())
                .build();

        contactMessageRepository.save(message);

        try {
            emailService.sendContactNotification(request);
        } catch (Exception e) {
            log.warn("Failed to send contact notification email: {}", e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public List<ContactMessageResponse> getAllMessages() {
        return contactMessageRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public ContactMessageResponse markAsRead(Long id) {
        ContactMessage msg = contactMessageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ContactMessage", id));
        msg.setReadStatus(true);
        return toResponse(contactMessageRepository.save(msg));
    }

    @Transactional
    public void deleteMessage(Long id) {
        if (!contactMessageRepository.existsById(id)) {
            throw new ResourceNotFoundException("ContactMessage", id);
        }
        contactMessageRepository.deleteById(id);
    }

    private ContactMessageResponse toResponse(ContactMessage m) {
        return ContactMessageResponse.builder()
                .id(m.getId())
                .name(m.getName())
                .email(m.getEmail())
                .phone(m.getPhone())
                .subject(m.getSubject())
                .message(m.getMessage())
                .readStatus(m.isReadStatus())
                .createdAt(m.getCreatedAt())
                .build();
    }
}
