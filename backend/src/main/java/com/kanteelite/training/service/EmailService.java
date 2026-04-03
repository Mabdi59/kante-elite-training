package com.kanteelite.training.service;

import com.kanteelite.training.dto.request.ContactRequest;
import com.kanteelite.training.dto.response.BookingResponse;
import com.kanteelite.training.dto.response.TeamRegistrationResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.internet.MimeMessage;

import java.util.List;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${app.email.from:kanteelitetraining@gmail.com}")
    private String fromAddress;

    @Value("${app.email.admin:kanteelitetraining@gmail.com}")
    private String adminEmail;

    @Value("${app.email.enabled:false}")
    private boolean emailEnabled;

    public EmailService(ObjectProvider<JavaMailSender> mailSenderProvider, TemplateEngine templateEngine) {
        this.mailSender = mailSenderProvider.getIfAvailable();
        this.templateEngine = templateEngine;
    }

    public boolean isEmailDeliveryAvailable() {
        return emailEnabled && mailSender != null;
    }

    public boolean sendBookingConfirmation(BookingResponse booking) {
        if (!emailEnabled) {
            log.info("Email disabled — skipping booking confirmation for {}", booking.getEmail());
            return false;
        }
        if (mailSender == null) {
            log.warn("Email enabled but JavaMailSender is not configured; skipping booking confirmation for {}", booking.getEmail());
            return false;
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
            return true;
        } catch (Exception e) {
            log.error("Failed to send booking confirmation to {}: {}", booking.getEmail(), e.getMessage());
            return false;
        }
    }

    public boolean sendBookingStatusUpdate(BookingResponse booking) {
        if (!emailEnabled) {
            log.info("Email disabled â€” skipping booking status email for {}", booking.getEmail());
            return false;
        }
        if (mailSender == null) {
            log.warn("Email enabled but JavaMailSender is not configured; skipping booking status email for {}", booking.getEmail());
            return false;
        }
        try {
            Context ctx = new Context();
            ctx.setVariable("booking", booking);
            ctx.setVariable("statusLabel", bookingStatusLabel(booking));
            ctx.setVariable("statusMessage", bookingStatusMessage(booking));

            String htmlBody = templateEngine.process("email/booking-status-update", ctx);
            sendHtmlEmail(booking.getEmail(), bookingStatusEmailSubject(booking), htmlBody, null);
            log.info("Booking status email sent to {} for booking {}", booking.getEmail(), booking.getId());
            return true;
        } catch (Exception e) {
            log.error("Failed to send booking status email to {}: {}", booking.getEmail(), e.getMessage());
            return false;
        }
    }

    public boolean sendPasswordResetEmail(String toEmail, String name, String resetToken) {
        if (!emailEnabled) {
            log.info("Email disabled — skipping password reset email for {}", toEmail);
            return false;
        }
        if (mailSender == null) {
            log.warn("Email enabled but JavaMailSender not configured; skipping password reset for {}", toEmail);
            return false;
        }
        try {
            Context ctx = new Context();
            ctx.setVariable("name", name);
            ctx.setVariable("resetToken", resetToken);

            String htmlBody = templateEngine.process("email/password-reset", ctx);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(toEmail);
            helper.setSubject("Reset Your Password — Kante Elite Training");
            helper.setText(htmlBody, true);

            mailSender.send(message);
            log.info("Password reset email sent to {}", toEmail);
            return true;
        } catch (Exception e) {
            log.error("Failed to send password reset email to {}: {}", toEmail, e.getMessage());
            return false;
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

    public void sendTournamentRegistrationConfirmation(
            TeamRegistrationResponse registration,
            List<String> nextSteps) {
        sendTournamentRegistrationEmail(
                registration,
                "Tournament Registration Received, Kante Elite Training",
                "Registration Received",
                "Your team has been added to our tournament registration queue. Use your Team Portal to track updates, complete payment, and submit your roster.",
                nextSteps
        );
    }

    public void sendTournamentRegistrationUpdate(
            TeamRegistrationResponse registration,
            String subject,
            String heroTitle,
            String intro,
            List<String> nextSteps) {
        sendTournamentRegistrationEmail(registration, subject, heroTitle, intro, nextSteps);
    }

    private void sendTournamentRegistrationEmail(
            TeamRegistrationResponse registration,
            String subject,
            String heroTitle,
            String intro,
            List<String> nextSteps) {
        if (!emailEnabled) {
            log.info("Email disabled, skipping tournament registration email for {}", registration.getContactEmail());
            return;
        }
        if (mailSender == null) {
            log.warn("Email enabled but JavaMailSender is not configured; skipping tournament registration email for {}", registration.getContactEmail());
            return;
        }
        if (!StringUtils.hasText(registration.getContactEmail())) {
            log.warn("Tournament registration {} has no contact email; skipping email.", registration.getId());
            return;
        }

        try {
            Context ctx = new Context();
            ctx.setVariable("registration", registration);
            ctx.setVariable("heroTitle", heroTitle);
            ctx.setVariable("intro", intro);
            ctx.setVariable("nextSteps", nextSteps);
            ctx.setVariable("ctaUrl", registration.getPublicAccessUrl());
            ctx.setVariable("ctaLabel", "Open Registration Workspace");

            String htmlBody = templateEngine.process("email/tournament-registration-update", ctx);
            sendHtmlEmail(registration.getContactEmail(), subject, htmlBody, null);
            log.info("Tournament registration email sent to {}", registration.getContactEmail());
        } catch (Exception e) {
            log.error("Failed to send tournament registration email to {}: {}",
                    registration.getContactEmail(), e.getMessage());
        }
    }

    private void sendHtmlEmail(String toEmail, String subject, String htmlBody, String replyTo) throws Exception {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setFrom(fromAddress);
        helper.setTo(toEmail);
        if (StringUtils.hasText(replyTo)) {
            helper.setReplyTo(replyTo);
        }
        helper.setSubject(subject);
        helper.setText(htmlBody, true);
        mailSender.send(message);
    }

    private String bookingStatusEmailSubject(BookingResponse booking) {
        return switch (booking.getBookingStatus()) {
            case CONFIRMED -> "Booking Confirmed â€” Kante Elite Training";
            case CANCELLED -> "Booking Cancelled â€” Kante Elite Training";
            default -> "Booking Updated â€” Kante Elite Training";
        };
    }

    private String bookingStatusLabel(BookingResponse booking) {
        return switch (booking.getBookingStatus()) {
            case CONFIRMED -> "Booking Confirmed";
            case CANCELLED -> "Booking Cancelled";
            default -> "Booking Updated";
        };
    }

    private String bookingStatusMessage(BookingResponse booking) {
        return switch (booking.getBookingStatus()) {
            case CONFIRMED -> "Your session is confirmed and ready to go.";
            case CANCELLED -> "Your session has been cancelled. If you still want to train, contact us and we will help you rebook.";
            default -> "Your booking details have been updated.";
        };
    }
}
