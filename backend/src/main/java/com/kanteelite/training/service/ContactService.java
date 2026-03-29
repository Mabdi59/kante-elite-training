package com.kanteelite.training.service;

import com.kanteelite.training.dto.request.ContactRequest;
import com.kanteelite.training.entity.ContactMessage;
import com.kanteelite.training.repository.ContactMessageRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

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
}
