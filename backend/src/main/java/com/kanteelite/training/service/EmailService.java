package com.kanteelite.training.service;

import com.kanteelite.training.dto.request.ContactRequest;
import com.kanteelite.training.dto.response.BookingResponse;
import com.kanteelite.training.dto.response.BookingSeriesResponse;
import com.kanteelite.training.dto.response.TeamRegistrationResponse;
import jakarta.annotation.PostConstruct;
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

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    public EmailService(ObjectProvider<JavaMailSender> mailSenderProvider, TemplateEngine templateEngine) {
        this.mailSender = mailSenderProvider.getIfAvailable();
        this.templateEngine = templateEngine;
    }

    @PostConstruct
    void configureEmailDelivery() {
        if (!emailEnabled && hasSmtpCredentials()) {
            emailEnabled = true;
            log.info("Email delivery enabled automatically because SMTP credentials are configured.");
            return;
        }

        if (emailEnabled && !hasSmtpCredentials()) {
            log.warn("Email is enabled but SMTP credentials are incomplete. Delivery attempts may fail.");
        }
    }

    public boolean isEmailDeliveryAvailable() {
        return emailEnabled && mailSender != null && hasSmtpCredentials();
    }

    public boolean sendBookingConfirmation(BookingResponse booking) {
        if (!emailEnabled) {
            log.info("Email disabled - skipping booking confirmation for {}", booking.getEmail());
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
            helper.setSubject("Booking Confirmed - Kante Elite Training");
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
            log.info("Email disabled - skipping booking status email for {}", booking.getEmail());
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
            log.info("Email disabled - skipping password reset email for {}", toEmail);
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
            helper.setSubject("Reset Your Password - Kante Elite Training");
            helper.setText(htmlBody, true);

            mailSender.send(message);
            log.info("Password reset email sent to {}", toEmail);
            return true;
        } catch (Exception e) {
            log.error("Failed to send password reset email to {}: {}", toEmail, e.getMessage());
            return false;
        }
    }

    public void sendAccountWelcomeEmail(String toEmail, String name) {
        if (!emailEnabled || mailSender == null) {
            log.info("Email disabled - skipping welcome email for {}", toEmail);
            return;
        }
        if (!StringUtils.hasText(toEmail)) return;

        String safeName = StringUtils.hasText(name) ? name : "there";
        String html = "<html><body style='font-family:sans-serif;color:#222;'>"
            + "<h2 style='color:#d97706;'>Kante Elite Training</h2>"
            + "<h3>Welcome</h3>"
            + "<p>Hi " + escapeHtml(safeName) + ",</p>"
            + "<p>Your account has been created successfully.</p>"
            + "<p>You can now sign in to manage bookings, enrollments, and notifications.</p>"
            + "<p style='color:#888;font-size:12px;'>The Kante Elite Training Team</p>"
            + "</body></html>";

        try {
            sendHtmlEmail(toEmail, "Welcome to Kante Elite Training", html, null);
            log.info("Welcome email sent to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send welcome email to {}: {}", toEmail, e.getMessage());
        }
    }

    public void sendContactNotification(ContactRequest request) {
        if (!emailEnabled) {
            log.info("Email disabled - skipping contact notification from {}", request.getEmail());
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
            helper.setSubject("New Contact Form Submission - " + request.getName());
            helper.setText(htmlBody, true);

            mailSender.send(message);
            log.info("Contact notification sent from {}", request.getEmail());
        } catch (Exception e) {
            log.error("Failed to send contact notification: {}", e.getMessage());
        }
    }

    public boolean sendSessionReminder(BookingResponse booking) {
        if (!emailEnabled) {
            log.info("Email disabled - skipping session reminder for {}", booking.getEmail());
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
            helper.setSubject("Reminder: Session Tomorrow - Kante Elite Training");
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
            log.info("Email disabled - skipping series confirmation for {}", toEmail);
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
            helper.setSubject("Recurring Schedule Confirmed - Kante Elite Training");
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
            case CONFIRMED -> "Booking Confirmed - Kante Elite Training";
            case CANCELLED -> "Booking Cancelled - Kante Elite Training";
            default -> "Booking Updated - Kante Elite Training";
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
            log.info("Email disabled - skipping enrollment status email for {}", toEmail);
            return;
        }
        if (!StringUtils.hasText(toEmail)) return;

        String subject = "Enrollment " + capitalize(status) + " - Kante Elite Training";
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
            + "<p style='color:#888;font-size:12px;'>The Kante Elite Training Team</p>"
            + "</body></html>";

        try {
            sendHtmlEmail(toEmail, subject, html, null);
            log.info("Enrollment status email ({}) sent to {}", status, toEmail);
        } catch (Exception e) {
            log.error("Failed to send enrollment email to {}: {}", toEmail, e.getMessage());
        }
    }

    public void sendEnrollmentCreatedEmail(String toEmail, String playerName, String programName) {
        if (!emailEnabled || mailSender == null) {
            log.info("Email disabled - skipping enrollment created email for {}", toEmail);
            return;
        }
        if (!StringUtils.hasText(toEmail)) return;

        String safePlayerName = StringUtils.hasText(playerName) ? playerName : "there";
        String html = "<html><body style='font-family:sans-serif;color:#222;'>"
            + "<h2 style='color:#d97706;'>Kante Elite Training</h2>"
            + "<h3>Enrollment Received</h3>"
            + "<p>Hi " + escapeHtml(safePlayerName) + ",</p>"
            + "<p>Your enrollment for <strong>" + escapeHtml(programName) + "</strong> has been recorded.</p>"
            + "<p>We will keep you updated by email when your enrollment or payment status changes.</p>"
            + "<p style='color:#888;font-size:12px;'>The Kante Elite Training Team</p>"
            + "</body></html>";

        try {
            sendHtmlEmail(toEmail, "Enrollment Received - " + escapeHtml(programName), html, null);
            log.info("Enrollment created email sent to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send enrollment created email to {}: {}", toEmail, e.getMessage());
        }
    }

    public void sendEnrollmentPaymentStatusEmail(String toEmail, String playerName, String programName, String paymentStatus) {
        if (!emailEnabled || mailSender == null) {
            log.info("Email disabled - skipping enrollment payment email for {}", toEmail);
            return;
        }
        if (!StringUtils.hasText(toEmail)) return;

        String safePlayerName = StringUtils.hasText(playerName) ? playerName : "there";
        String paymentLabel = formatEnumLabel(paymentStatus);
        String html = "<html><body style='font-family:sans-serif;color:#222;'>"
            + "<h2 style='color:#d97706;'>Kante Elite Training</h2>"
            + "<h3>Enrollment Payment Update</h3>"
            + "<p>Hi " + escapeHtml(safePlayerName) + ",</p>"
            + "<p>Your payment status for <strong>" + escapeHtml(programName) + "</strong> is now <strong>" + escapeHtml(paymentLabel) + "</strong>.</p>"
            + "<p>If you have any questions, reply to this email and our team will help.</p>"
            + "<p style='color:#888;font-size:12px;'>The Kante Elite Training Team</p>"
            + "</body></html>";

        try {
            sendHtmlEmail(toEmail, "Payment Update - " + escapeHtml(programName), html, null);
            log.info("Enrollment payment status email ({}) sent to {}", paymentStatus, toEmail);
        } catch (Exception e) {
            log.error("Failed to send enrollment payment email to {}: {}", toEmail, e.getMessage());
        }
    }

    public void sendBookingRescheduledEmail(BookingResponse booking, LocalDate oldDate, String oldTime) {
        if (!emailEnabled || mailSender == null) {
            log.info("Email disabled - skipping booking rescheduled email for {}", booking.getEmail());
            return;
        }
        if (!StringUtils.hasText(booking.getEmail())) return;

        String safeName = StringUtils.hasText(booking.getParentName()) ? booking.getParentName() : booking.getPlayerName();
        String html = "<html><body style='font-family:sans-serif;color:#222;'>"
            + "<h2 style='color:#d97706;'>Kante Elite Training</h2>"
            + "<h3>Booking Rescheduled</h3>"
            + "<p>Hi " + escapeHtml(StringUtils.hasText(safeName) ? safeName : "there") + ",</p>"
            + "<p>Your booking for <strong>" + escapeHtml(booking.getProgramName()) + "</strong> has been rescheduled.</p>"
            + "<p><strong>Previous slot:</strong> " + escapeHtml(String.valueOf(oldDate)) + " at " + escapeHtml(oldTime) + "</p>"
            + "<p><strong>New slot:</strong> " + escapeHtml(String.valueOf(booking.getBookingDate())) + " at " + escapeHtml(booking.getBookingTime()) + "</p>"
            + "<p style='color:#888;font-size:12px;'>The Kante Elite Training Team</p>"
            + "</body></html>";

        try {
            sendHtmlEmail(booking.getEmail(), "Booking Rescheduled - Kante Elite Training", html, null);
            log.info("Booking rescheduled email sent to {} for booking {}", booking.getEmail(), booking.getId());
        } catch (Exception e) {
            log.error("Failed to send booking rescheduled email to {}: {}", booking.getEmail(), e.getMessage());
        }
    }

    public void sendProgramParticipantEmail(String toEmail, String participantName, String programName, boolean added) {
        if (!emailEnabled || mailSender == null) {
            log.info("Email disabled - skipping program participant email for {}", toEmail);
            return;
        }
        if (!StringUtils.hasText(toEmail)) return;

        String actionLabel = added ? "Added to Program" : "Removed from Program";
        String bodyLabel = added ? "has been added to" : "has been removed from";
        String html = "<html><body style='font-family:sans-serif;color:#222;'>"
            + "<h2 style='color:#d97706;'>Kante Elite Training</h2>"
            + "<h3>" + actionLabel + "</h3>"
            + "<p>Hi " + escapeHtml(StringUtils.hasText(participantName) ? participantName : "there") + ",</p>"
            + "<p>Your profile " + bodyLabel + " <strong>" + escapeHtml(programName) + "</strong>.</p>"
            + "<p style='color:#888;font-size:12px;'>The Kante Elite Training Team</p>"
            + "</body></html>";

        try {
            sendHtmlEmail(toEmail, actionLabel + " - " + escapeHtml(programName), html, null);
            log.info("Program participant email sent to {} for program {}", toEmail, programName);
        } catch (Exception e) {
            log.error("Failed to send program participant email to {}: {}", toEmail, e.getMessage());
        }
    }

    public void sendEventParticipantEmail(String toEmail, String participantName, String eventTitle, boolean added) {
        if (!emailEnabled || mailSender == null) {
            log.info("Email disabled - skipping event participant email for {}", toEmail);
            return;
        }
        if (!StringUtils.hasText(toEmail)) return;

        String actionLabel = added ? "Event Registration Confirmed" : "Event Registration Removed";
        String bodyLabel = added ? "has been registered for" : "has been removed from";
        String html = "<html><body style='font-family:sans-serif;color:#222;'>"
            + "<h2 style='color:#d97706;'>Kante Elite Training</h2>"
            + "<h3>" + actionLabel + "</h3>"
            + "<p>Hi " + escapeHtml(StringUtils.hasText(participantName) ? participantName : "there") + ",</p>"
            + "<p>Your profile " + bodyLabel + " <strong>" + escapeHtml(eventTitle) + "</strong>.</p>"
            + "<p style='color:#888;font-size:12px;'>The Kante Elite Training Team</p>"
            + "</body></html>";

        try {
            sendHtmlEmail(toEmail, actionLabel + " - " + escapeHtml(eventTitle), html, null);
            log.info("Event participant email sent to {} for event {}", toEmail, eventTitle);
        } catch (Exception e) {
            log.error("Failed to send event participant email to {}: {}", toEmail, e.getMessage());
        }
    }

    public void sendEventLifecycleEmail(String toEmail, String participantName, String eventTitle, String action, String detail) {
        if (!emailEnabled || mailSender == null) {
            log.info("Email disabled - skipping event lifecycle email for {}", toEmail);
            return;
        }
        if (!StringUtils.hasText(toEmail)) return;

        String safeAction = StringUtils.hasText(action) ? action.trim().toLowerCase() : "updated";
        String actionLabel = formatEnumLabel(safeAction);
        String safeDetail = StringUtils.hasText(detail) ? detail : "Event details have changed.";
        String html = "<html><body style='font-family:sans-serif;color:#222;'>"
            + "<h2 style='color:#d97706;'>Kante Elite Training</h2>"
            + "<h3>Event " + escapeHtml(actionLabel) + "</h3>"
            + "<p>Hi " + escapeHtml(StringUtils.hasText(participantName) ? participantName : "there") + ",</p>"
            + "<p><strong>" + escapeHtml(eventTitle) + "</strong> was " + escapeHtml(actionLabel) + ".</p>"
            + "<p>" + escapeHtml(safeDetail) + "</p>"
            + "<p style='color:#888;font-size:12px;'>The Kante Elite Training Team</p>"
            + "</body></html>";

        try {
            sendHtmlEmail(toEmail, "Event " + capitalize(safeAction) + " - " + escapeHtml(eventTitle), html, null);
            log.info("Event lifecycle email ({}) sent to {} for event {}", safeAction, toEmail, eventTitle);
        } catch (Exception e) {
            log.error("Failed to send event lifecycle email to {}: {}", toEmail, e.getMessage());
        }
    }

    public void sendMessageReceivedEmail(String toEmail, String recipientName, String senderName, String subject, String bodyPreview) {
        if (!emailEnabled || mailSender == null) {
            log.info("Email disabled - skipping message receipt email for {}", toEmail);
            return;
        }
        if (!StringUtils.hasText(toEmail)) return;

        String preview = bodyPreview != null && bodyPreview.length() > 200
                ? bodyPreview.substring(0, 200) + "…"
                : (bodyPreview != null ? bodyPreview : "");

        String html = "<html><body style='font-family:sans-serif;color:#222;'>"
            + "<h2 style='color:#d97706;'>Kante Elite Training</h2>"
            + "<h3>New Message</h3>"
            + "<p>Hi " + escapeHtml(recipientName) + ",</p>"
            + "<p>You have received a new message from <strong>" + escapeHtml(senderName) + "</strong>.</p>"
            + "<p><strong>Subject:</strong> " + escapeHtml(subject) + "</p>"
            + "<blockquote style='border-left:3px solid #d97706;margin:8px 0;padding:6px 12px;color:#444;'>"
            + escapeHtml(preview)
            + "</blockquote>"
            + "<p>Log in to your portal to read and reply.</p>"
            + "<p style='color:#888;font-size:12px;'>The Kante Elite Training Team</p>"
            + "</body></html>";

        try {
            sendHtmlEmail(toEmail, "New Message: " + escapeHtml(subject) + " - Kante Elite Training", html, null);
            log.info("Message receipt email sent to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send message receipt email to {}: {}", toEmail, e.getMessage());
        }
    }

    public void sendAttendanceMarkedEmail(String toEmail, String playerName, String sessionDate, String status, String coachNotes) {
        if (!emailEnabled || mailSender == null) {
            log.info("Email disabled - skipping attendance email for {}", toEmail);
            return;
        }
        if (!StringUtils.hasText(toEmail)) return;

        String statusLabel = switch (status.toUpperCase()) {
            case "PRESENT" -> "✅ Present";
            case "ABSENT" -> "❌ Absent";
            case "LATE" -> "⏰ Late";
            default -> escapeHtml(status);
        };

        String html = "<html><body style='font-family:sans-serif;color:#222;'>"
            + "<h2 style='color:#d97706;'>Kante Elite Training</h2>"
            + "<h3>Attendance Update</h3>"
            + "<p>Hi " + escapeHtml(playerName) + ",</p>"
            + "<p>Your attendance for the session on <strong>" + escapeHtml(sessionDate) + "</strong> has been recorded.</p>"
            + "<p><strong>Status:</strong> " + statusLabel + "</p>"
            + (StringUtils.hasText(coachNotes)
                ? "<p><strong>Coach notes:</strong> " + escapeHtml(coachNotes) + "</p>"
                : "")
            + "<p style='color:#888;font-size:12px;'>The Kante Elite Training Team</p>"
            + "</body></html>";

        try {
            sendHtmlEmail(toEmail, "Attendance Recorded - " + escapeHtml(sessionDate) + " - Kante Elite Training", html, null);
            log.info("Attendance email sent to {} for session {}", toEmail, sessionDate);
        } catch (Exception e) {
            log.error("Failed to send attendance email to {}: {}", toEmail, e.getMessage());
        }
    }

    public void sendWaiverSignedEmail(String toEmail, String userName, String waiverTitle) {
        if (!emailEnabled || mailSender == null) {
            log.info("Email disabled - skipping waiver signed email for {}", toEmail);
            return;
        }
        if (!StringUtils.hasText(toEmail)) return;

        String html = "<html><body style='font-family:sans-serif;color:#222;'>"
            + "<h2 style='color:#d97706;'>Kante Elite Training</h2>"
            + "<h3>Waiver Signed</h3>"
            + "<p>Hi " + escapeHtml(userName) + ",</p>"
            + "<p>You have successfully signed the waiver: <strong>" + escapeHtml(waiverTitle) + "</strong>.</p>"
            + "<p>A record of your signature has been saved. You can view your signed waivers in your portal.</p>"
            + "<p style='color:#888;font-size:12px;'>The Kante Elite Training Team</p>"
            + "</body></html>";

        try {
            sendHtmlEmail(toEmail, "Waiver Signed - Kante Elite Training", html, null);
            log.info("Waiver signed email sent to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send waiver email to {}: {}", toEmail, e.getMessage());
        }
    }

    private String capitalize(String s) {
        if (!StringUtils.hasText(s)) return s;
        return Character.toUpperCase(s.charAt(0)) + s.substring(1).toLowerCase();
    }

    private boolean hasSmtpCredentials() {
        return StringUtils.hasText(mailUsername) && StringUtils.hasText(mailPassword);
    }

    private String formatEnumLabel(String value) {
        if (!StringUtils.hasText(value)) {
            return "Unknown";
        }
        return value.trim().replace('_', ' ').toLowerCase();
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
