package com.kanteelite.training.service;

import com.kanteelite.training.dto.request.ContactRequest;
import com.kanteelite.training.dto.response.BookingResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${app.email.from:noreply@kanteelitetraining.com}")
    private String fromAddress;

    @Value("${app.email.admin:admin@kanteelitetraining.com}")
    private String adminEmail;

    @Value("${app.email.enabled:false}")
    private boolean emailEnabled;

    public EmailService(ObjectProvider<JavaMailSender> mailSenderProvider, TemplateEngine templateEngine) {
        this.mailSender = mailSenderProvider.getIfAvailable();
        this.templateEngine = templateEngine;
    }

    public void sendBookingConfirmation(BookingResponse booking) {
        if (!emailEnabled) {
            log.info("Email disabled — skipping booking confirmation for {}", booking.getEmail());
            return;
        }
        if (mailSender == null) {
            log.warn("Email enabled but JavaMailSender is not configured; skipping booking confirmation for {}", booking.getEmail());
            return;
        }
        try {
            Context ctx = new Context();
            ctx.setVariable("booking", booking);

            String htmlBody = templateEngine.process("email/booking-confirmation", ctx);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(booking.getEmail());
            helper.setSubject("Booking Confirmed — Kante Elite Training");
            helper.setText(htmlBody, true);

            mailSender.send(message);
            log.info("Booking confirmation sent to {}", booking.getEmail());
        } catch (Exception e) {
            log.error("Failed to send booking confirmation to {}: {}", booking.getEmail(), e.getMessage());
        }
    }

    public void sendContactNotification(ContactRequest request) {
        if (!emailEnabled) {
            log.info("Email disabled — skipping contact notification from {}", request.getEmail());
            return;
        }
        if (mailSender == null) {
            log.warn("Email enabled but JavaMailSender is not configured; skipping contact notification from {}", request.getEmail());
            return;
        }
        try {
            Context ctx = new Context();
            ctx.setVariable("contact", request);

            String htmlBody = templateEngine.process("email/contact-notification", ctx);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(adminEmail);
            helper.setReplyTo(request.getEmail());
            helper.setSubject("New Contact Form Submission — " + request.getName());
            helper.setText(htmlBody, true);

            mailSender.send(message);
            log.info("Contact notification sent from {}", request.getEmail());
        } catch (Exception e) {
            log.error("Failed to send contact notification: {}", e.getMessage());
        }
    }
}
