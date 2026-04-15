package com.kanteelite.training.service;

import com.kanteelite.training.dto.request.ContactRequest;
import com.kanteelite.training.dto.response.BookingResponse;
import com.kanteelite.training.dto.response.BookingSeriesResponse;
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

import java.time.LocalDate;
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

    public boolean sendSessionReminder(BookingResponse booking) {
        if (!emailEnabled) {
            log.info("Email disabled — skipping session reminder for {}", booking.getEmail());
            return false;
        }
        if (mailSender == null) {
            log.warn("Email enabled but JavaMailSender is not configured; skipping session reminder for {}", booking.getEmail());
            return false;
        }
        try {
            Context ctx = new Context();
            ctx.setVariable("booking", booking);

            String htmlBody = templateEngine.process("email/session-reminder", ctx);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(booking.getEmail());
            helper.setSubject("Reminder: Session Tomorrow — Kante Elite Training");
            helper.setText(htmlBody, true);

            mailSender.send(message);
            log.info("Session reminder sent to {} for booking {}", booking.getEmail(), booking.getId());
            return true;
        } catch (Exception e) {
            log.error("Failed to send session reminder to {}: {}", booking.getEmail(), e.getMessage());
            return false;
        }
    }

    public boolean sendBookingSeriesConfirmation(String toEmail, BookingSeriesResponse series, List<LocalDate> sessionDates) {
        if (!emailEnabled) {
            log.info("Email disabled — skipping series confirmation for {}", toEmail);
            return false;
        }
        if (mailSender == null) {
            log.warn("Email enabled but JavaMailSender is not configured; skipping series confirmation for {}", toEmail);
            return false;
        }
        if (!StringUtils.hasText(toEmail)) {
            log.warn("No email address for series confirmation; skipping.");
            return false;
        }
        try {
            Context ctx = new Context();
            ctx.setVariable("series", series);
            ctx.setVariable("sessionDates", sessionDates);

            String htmlBody = templateEngine.process("email/series-confirmation", ctx);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(toEmail);
            helper.setSubject("Recurring Schedule Confirmed — Kante Elite Training");
            helper.setText(htmlBody, true);

            mailSender.send(message);
            log.info("Series confirmation sent to {} for series {}", toEmail, series.getId());
            return true;
        } catch (Exception e) {
            log.error("Failed to send series confirmation to {}: {}", toEmail, e.getMessage());
            return false;
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

    public void sendEnrollmentStatusEmail(String toEmail, String playerName, String programName, String status) {
        if (!emailEnabled || mailSender == null) {
            log.info("Email disabled — skipping enrollment status email for {}", toEmail);
            return;
        }
        if (!StringUtils.hasText(toEmail)) return;

        String subject = "Enrollment " + capitalize(status) + " — Kante Elite Training";
        String escapedStatus = escapeHtml(status);
        String statusMsg = switch (status.toUpperCase()) {
            case "APPROVED" -> "Your enrollment has been <strong>approved</strong>! You are now officially enrolled.";
            case "REJECTED" -> "Unfortunately, your enrollment has been <strong>declined</strong>. Please contact us if you have questions.";
            case "WAITLISTED" -> "You have been added to the <strong>waitlist</strong>. We will contact you if a spot opens up.";
            default -> "Your enrollment status has been updated to <strong>" + escapedStatus + "</strong>.";
        };

        String html = "<html><body style='font-family:sans-serif;color:#222;'>"
            + "<h2 style='color:#d97706;'>Kante Elite Training</h2>"
            + "<h3>Enrollment Update: " + escapeHtml(programName) + "</h3>"
            + "<p>Hi " + escapeHtml(playerName) + ",</p>"
            + "<p>" + statusMsg + "</p>"
            + "<p style='color:#555;'>Program: <strong>" + escapeHtml(programName) + "</strong></p>"
            + "<p style='color:#888;font-size:12px;'>— The Kante Elite Training Team</p>"
            + "</body></html>";

        try {
            sendHtmlEmail(toEmail, subject, html, null);
            log.info("Enrollment status email ({}) sent to {}", status, toEmail);
        } catch (Exception e) {
            log.error("Failed to send enrollment email to {}: {}", toEmail, e.getMessage());
        }
    }

    public void sendWaiverSignedEmail(String toEmail, String userName, String waiverTitle) {
        if (!emailEnabled || mailSender == null) {
            log.info("Email disabled — skipping waiver signed email for {}", toEmail);
            return;
        }
        if (!StringUtils.hasText(toEmail)) return;

        String html = "<html><body style='font-family:sans-serif;color:#222;'>"
            + "<h2 style='color:#d97706;'>Kante Elite Training</h2>"
            + "<h3>Waiver Signed</h3>"
            + "<p>Hi " + escapeHtml(userName) + ",</p>"
            + "<p>You have successfully signed the waiver: <strong>" + escapeHtml(waiverTitle) + "</strong>.</p>"
            + "<p>A record of your signature has been saved. You can view your signed waivers in your portal.</p>"
            + "<p style='color:#888;font-size:12px;'>— The Kante Elite Training Team</p>"
            + "</body></html>";

        try {
            sendHtmlEmail(toEmail, "Waiver Signed — Kante Elite Training", html, null);
            log.info("Waiver signed email sent to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send waiver email to {}: {}", toEmail, e.getMessage());
        }
    }

    private String capitalize(String s) {
        if (!StringUtils.hasText(s)) return s;
        return Character.toUpperCase(s.charAt(0)) + s.substring(1).toLowerCase();
    }

    private String escapeHtml(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}
