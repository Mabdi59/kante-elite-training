package com.kanteelite.training.service;

import com.kanteelite.training.dto.request.ParticipantAssignmentRequest;
import com.kanteelite.training.dto.request.CheckoutRequest;
import com.kanteelite.training.dto.request.PublicProgramRegistrationRequest;
import com.kanteelite.training.dto.request.RegistrationRequest;
import com.kanteelite.training.dto.request.RescheduleRegistrationRequest;
import com.kanteelite.training.dto.response.ManagedParticipantResponse;
import com.kanteelite.training.dto.response.RegistrationHistoryResponse;
import com.kanteelite.training.dto.response.RegistrationResponse;
import com.kanteelite.training.entity.Event;
import com.kanteelite.training.entity.PaymentRecord;
import com.kanteelite.training.entity.PlayerProfile;
import com.kanteelite.training.entity.Program;
import com.kanteelite.training.entity.Registration;
import com.kanteelite.training.entity.RegistrationHistory;
import com.kanteelite.training.entity.TrainingSession;
import com.kanteelite.training.entity.User;
import com.kanteelite.training.enums.RegistrationActorType;
import com.kanteelite.training.enums.RegistrationOfferingType;
import com.kanteelite.training.enums.RegistrationPaymentStatus;
import com.kanteelite.training.enums.RegistrationSource;
import com.kanteelite.training.enums.RegistrationStatus;
import com.kanteelite.training.enums.RegistrationType;
import com.kanteelite.training.exception.ResourceNotFoundException;
import com.kanteelite.training.exception.SlotUnavailableException;
import com.kanteelite.training.repository.EventRepository;
import com.kanteelite.training.repository.PaymentRecordRepository;
import com.kanteelite.training.repository.PlayerProfileRepository;
import com.kanteelite.training.repository.ProgramRepository;
import com.kanteelite.training.repository.RegistrationHistoryRepository;
import com.kanteelite.training.repository.RegistrationRepository;
import com.kanteelite.training.repository.TrainingSessionRepository;
import com.kanteelite.training.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RegistrationService {

    private static final Set<RegistrationStatus> CAPACITY_HOLDING_STATUSES = Set.of(
            RegistrationStatus.PENDING,
            RegistrationStatus.CONFIRMED
    );

    private final RegistrationRepository registrationRepository;
    private final RegistrationHistoryRepository historyRepository;
    private final PaymentRecordRepository paymentRecordRepository;
    private final ProgramRepository programRepository;
    private final EventRepository eventRepository;
    private final TrainingSessionRepository trainingSessionRepository;
    private final UserRepository userRepository;
    private final PlayerProfileRepository playerProfileRepository;
    private final AvailabilityService availabilityService;
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final TrainingSessionService trainingSessionService;

    @Transactional
    public RegistrationResponse createPublicProgramBooking(
            PublicProgramRegistrationRequest request,
            String authenticatedEmail) {
        Program program = programRepository.findById(request.getProgramId())
                .orElseThrow(() -> new ResourceNotFoundException("Program", request.getProgramId()));

        Registration registration = buildBaseRegistration();
        registration.setOfferingType(RegistrationOfferingType.PROGRAM);
        registration.setProgram(program);
        registration.setRegistrationType(RegistrationType.PROGRAM_BOOKING);
        registration.setParticipantName(trim(request.getPlayerName()));
        registration.setParticipantAge(trim(request.getPlayerAge()));
        registration.setGuardianName(trim(request.getParentName()));
        registration.setGuardianEmail(normalizeEmail(
                StringUtils.hasText(authenticatedEmail) ? authenticatedEmail : request.getEmail()));
        registration.setGuardianPhone(trim(request.getPhone()));
        registration.setExperienceLevel(trim(request.getExperienceLevel()));
        registration.setScheduledDate(request.getBookingDate());
        registration.setScheduledStartTime(trim(request.getBookingTime()));
        registration.setPriceAmount(program.getPrice());
        registration.setPaymentStatus(resolvePaymentStatus(program.getPrice()));
        registration.setCustomerNotes(trim(request.getNotes()));
        registration.setSource(RegistrationSource.PUBLIC);

        Registration saved = saveWithCapacityDecision(registration, registration.getGuardianEmail());
        sendProgramBookingNotice(saved);
        RegistrationResponse response = toResponse(saved, true);
        response.setConfirmationEmailAvailable(saved.getStatus() == RegistrationStatus.CONFIRMED
                && emailService.sendRegistrationConfirmation(response));
        return response;
    }

    @Transactional
    public Registration createPendingCheckoutRegistration(CheckoutRequest request) {
        Program program = programRepository.findById(request.getProgramId())
                .orElseThrow(() -> new ResourceNotFoundException("Program", request.getProgramId()));

        Registration registration = buildBaseRegistration();
        registration.setOfferingType(RegistrationOfferingType.PROGRAM);
        registration.setProgram(program);
        registration.setRegistrationType(RegistrationType.PROGRAM_BOOKING);
        registration.setStatus(RegistrationStatus.PENDING);
        registration.setPaymentStatus(RegistrationPaymentStatus.PENDING);
        registration.setParticipantName(trim(request.getPlayerName()));
        registration.setParticipantAge(trim(request.getPlayerAge()));
        registration.setGuardianName(trim(request.getParentName()));
        registration.setGuardianEmail(normalizeEmail(request.getEmail()));
        registration.setGuardianPhone(trim(request.getPhone()));
        registration.setExperienceLevel(trim(request.getExperienceLevel()));
        registration.setScheduledDate(request.getBookingDate());
        registration.setScheduledStartTime(trim(request.getBookingTime()));
        registration.setPriceAmount(program.getPrice());
        registration.setCustomerNotes(trim(request.getNotes()));
        registration.setSource(RegistrationSource.PUBLIC);

        validateBookable(registration);
        validateDuplicate(registration);
        attachTrainingSessionIfNeeded(registration);
        ensureCapacityAvailable(registration, null);

        Registration saved = registrationRepository.save(registration);
        appendHistory(saved, "CHECKOUT_STARTED",
                "Stripe checkout started; registration is holding capacity until payment completes.",
                null, saved.getStatus(), null, saved.getPaymentStatus(),
                RegistrationActorType.PUBLIC, saved.getGuardianEmail());
        return saved;
    }

    @Transactional
    public RegistrationResponse createPublicEventRegistration(Long eventId, String participantName, String guardianEmail) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", eventId));
        Registration registration = buildBaseRegistration();
        registration.setOfferingType(RegistrationOfferingType.EVENT);
        registration.setEvent(event);
        registration.setRegistrationType(RegistrationType.EVENT_REGISTRATION);
        registration.setParticipantName(trim(participantName));
        registration.setGuardianEmail(normalizeEmail(guardianEmail));
        registration.setPaymentStatus(resolvePaymentStatus(event.getPrice()));
        registration.setPriceAmount(event.getPrice());
        registration.setSource(RegistrationSource.PUBLIC);
        Registration saved = saveWithCapacityDecision(registration, "public");
        sendEventRegistrationNotice(saved);
        return toResponse(saved, true);
    }

    @Transactional
    public RegistrationResponse createPublicEventSessionRegistration(
            Event event,
            TrainingSession session,
            com.kanteelite.training.dto.request.SimpleEventRegistrationRequest request,
            BigDecimal price,
            String packageType
    ) {
        Registration registration = buildBaseRegistration();
        registration.setOfferingType(RegistrationOfferingType.EVENT);
        registration.setEvent(event);
        registration.setTrainingSession(session);
        registration.setRegistrationType(RegistrationType.EVENT_REGISTRATION);
        registration.setParticipantName(trim(request.getName()));
        registration.setParticipantAge(trim(request.getPlayerAge()));
        registration.setParticipantPhone(trim(request.getPhone()));
        registration.setGuardianEmail(normalizeEmail(request.getEmail()));
        registration.setGuardianPhone(trim(request.getPhone()));
        registration.setScheduledDate(session.getScheduledDate());
        registration.setScheduledStartTime(session.getStartTime());
        registration.setScheduledEndTime(session.getEndTime());
        registration.setTimezone(session.getTimezone());
        registration.setPriceAmount(price);
        registration.setPaymentStatus(resolvePaymentStatus(price));
        registration.setSource(RegistrationSource.PUBLIC);
        registration.setCustomerNotes(StringUtils.hasText(packageType)
                ? "Summer Training package: " + packageType
                : null);
        Registration saved = saveWithCapacityDecision(registration, "public");
        sendEventRegistrationNotice(saved);
        return toResponse(saved, true);
    }

    @Transactional
    public RegistrationResponse createAdminRegistration(RegistrationRequest request, String actorEmail) {
        Registration registration = buildFromRequest(request, RegistrationSource.ADMIN);
        Registration saved = saveWithCapacityDecision(registration, actorEmail);
        return toResponse(saved, true);
    }

    @Transactional
    public RegistrationResponse updateAdminRegistration(Long id, RegistrationRequest request, String actorEmail) {
        Registration registration = getRegistrationEntity(id);
        RegistrationStatus previousStatus = registration.getStatus();
        RegistrationPaymentStatus previousPaymentStatus = registration.getPaymentStatus();

        applyRegistrationRequest(registration, request, RegistrationSource.ADMIN);
        validateBookable(registration);
        ensureCapacityAvailable(registration, id);

        Registration saved = registrationRepository.save(registration);
        appendHistory(saved, "UPDATED", "Registration details updated.",
                previousStatus, saved.getStatus(),
                previousPaymentStatus, saved.getPaymentStatus(),
                RegistrationActorType.ADMIN, actorEmail);
        return toResponse(saved, true);
    }

    @Transactional
    public void deleteAdminRegistration(Long id) {
        Registration registration = getRegistrationEntity(id);
        paymentRecordRepository.deleteByRegistrationId(id);
        historyRepository.deleteByRegistrationId(id);
        registrationRepository.delete(registration);
    }

    @Transactional
    public RegistrationResponse createSessionSeriesRegistration(
            TrainingSession session,
            PlayerProfile player,
            String actorEmail,
            String notes
    ) {
        User parent = player.getParentUser();
        String guardianEmail = normalizeEmail(parent != null ? parent.getEmail() : actorEmail);
        String participantName = trim(player.getName());
        boolean alreadyRegistered = registrationRepository.findByTrainingSessionIdOrderByCreatedAtAsc(session.getId())
                .stream()
                .anyMatch(existing -> existing.getStatus() != RegistrationStatus.CANCELLED
                        && participantName != null
                        && participantName.equalsIgnoreCase(existing.getParticipantName())
                        && guardianEmail != null
                        && guardianEmail.equalsIgnoreCase(normalizeEmail(existing.getGuardianEmail())));
        if (alreadyRegistered) {
            return null;
        }

        long activeCount = registrationRepository.countByTrainingSessionIdAndStatusIn(
                session.getId(), CAPACITY_HOLDING_STATUSES);
        int capacity = resolveCapacity(session.getCapacity());
        if (activeCount >= capacity) {
            throw new SlotUnavailableException("Session capacity has been reached.");
        }

        Registration registration = buildBaseRegistration();
        registration.setOfferingType(RegistrationOfferingType.PROGRAM);
        registration.setProgram(session.getProgram());
        registration.setTrainingSession(session);
        registration.setRegistrationType(RegistrationType.PROGRAM_BOOKING);
        registration.setStatus(RegistrationStatus.CONFIRMED);
        registration.setConfirmedAt(LocalDateTime.now());
        registration.setPaymentStatus(resolvePaymentStatus(session.getProgram().getPrice()));
        registration.setSource(RegistrationSource.ADMIN);
        registration.setParticipantName(participantName);
        registration.setParticipantAge(player.getAge() != null ? String.valueOf(player.getAge()) : null);
        registration.setGuardianName(parent != null ? trim(parent.getName()) : null);
        registration.setGuardianEmail(guardianEmail);
        registration.setScheduledDate(session.getScheduledDate());
        registration.setScheduledStartTime(session.getStartTime());
        registration.setScheduledEndTime(session.getEndTime());
        registration.setTimezone(session.getTimezone());
        registration.setPriceAmount(session.getProgram().getPrice());
        registration.setCustomerNotes(trim(notes));

        Registration saved = registrationRepository.save(registration);
        appendHistory(saved, "SESSION_SERIES_CREATED",
                "Registration created from recurring session series.",
                null, saved.getStatus(), null, saved.getPaymentStatus(),
                RegistrationActorType.ADMIN, actorEmail);
        return toResponse(saved, false);
    }

    @Transactional
    public ManagedParticipantResponse createAdminEntryFromAssignment(
            RegistrationOfferingType offeringType,
            Long offeringId,
            ParticipantAssignmentRequest request,
            String actorEmail
    ) {
        Registration registration = buildBaseRegistration();
        registration.setOfferingType(offeringType);
        registration.setRegistrationType(RegistrationType.ADMIN_ENTRY);
        registration.setSource(RegistrationSource.ADMIN);
        registration.setStatus(RegistrationStatus.CONFIRMED);
        registration.setConfirmedAt(LocalDateTime.now());

        if (offeringType == RegistrationOfferingType.PROGRAM) {
            Program program = programRepository.findById(offeringId)
                    .orElseThrow(() -> new ResourceNotFoundException("Program", offeringId));
            registration.setProgram(program);
            registration.setPriceAmount(program.getPrice());
            registration.setPaymentStatus(resolvePaymentStatus(program.getPrice()));
        } else {
            Event event = eventRepository.findById(offeringId)
                    .orElseThrow(() -> new ResourceNotFoundException("Event", offeringId));
            registration.setEvent(event);
            registration.setPriceAmount(event.getPrice());
            registration.setPaymentStatus(resolvePaymentStatus(event.getPrice()));
        }

        applyParticipantAssignment(registration, request);
        Registration saved = saveWithCapacityDecision(registration, actorEmail);
        return toManagedParticipantResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<RegistrationResponse> getAllRegistrations(
            RegistrationOfferingType offeringType,
            RegistrationStatus status,
            RegistrationPaymentStatus paymentStatus,
            Long programId,
            Long eventId,
            java.time.LocalDate scheduledDate
    ) {
        return registrationRepository.findAllWithOfferingsOrderByCreatedAtDesc().stream()
                .filter(r -> offeringType == null || r.getOfferingType() == offeringType)
                .filter(r -> status == null || r.getStatus() == status)
                .filter(r -> paymentStatus == null || r.getPaymentStatus() == paymentStatus)
                .filter(r -> programId == null || (r.getProgram() != null && programId.equals(r.getProgram().getId())))
                .filter(r -> eventId == null || (r.getEvent() != null && eventId.equals(r.getEvent().getId())))
                .filter(r -> scheduledDate == null || scheduledDate.equals(r.getScheduledDate()))
                .map(r -> toResponse(r, false))
                .toList();
    }

    @Transactional(readOnly = true)
    public RegistrationResponse getRegistration(Long id) {
        Registration registration = registrationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Registration", id));
        return toResponse(registration, true);
    }

    @Transactional(readOnly = true)
    public RegistrationResponse getRegistrationByCode(String registrationCode) {
        Registration registration = registrationRepository.findByRegistrationCode(registrationCode)
                .orElseThrow(() -> new ResourceNotFoundException("Registration not found with code: " + registrationCode));
        return toResponse(registration, true);
    }

    @Transactional(readOnly = true)
    public RegistrationResponse getPublicRegistration(Long id) {
        Registration registration = registrationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Registration", id));
        return toPublicResponse(registration);
    }

    @Transactional(readOnly = true)
    public RegistrationResponse getPublicRegistrationByCode(String registrationCode) {
        Registration registration = registrationRepository.findByRegistrationCode(registrationCode)
                .orElseThrow(() -> new ResourceNotFoundException("Registration not found with code: " + registrationCode));
        return toPublicResponse(registration);
    }

    @Transactional(readOnly = true)
    public RegistrationResponse getPublicRegistrationByStripeSession(String stripeSessionId) {
        PaymentRecord paymentRecord = paymentRecordRepository.findByStripeSessionId(stripeSessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Registration not found for Stripe session: " + stripeSessionId));
        return toPublicResponse(paymentRecord.getRegistration());
    }

    @Transactional(readOnly = true)
    public List<RegistrationResponse> getAccountRegistrations(String userEmail) {
        String email = normalizeEmail(userEmail);
        return registrationRepository.findAccountHistoryByEmail(email).stream()
                .map(this::toPublicResponse)
                .toList();
    }

    @Transactional
    public RegistrationResponse cancelOwnRegistration(Long id, String userEmail) {
        Registration registration = getRegistrationEntity(id);
        String email = normalizeEmail(userEmail);
        if (!isRegistrationOwner(registration, email)) {
            throw new IllegalArgumentException("You are not authorized to cancel this registration.");
        }
        if (registration.getStatus() == RegistrationStatus.CANCELLED) {
            throw new IllegalArgumentException("Registration is already cancelled.");
        }

        RegistrationStatus previousStatus = registration.getStatus();
        RegistrationPaymentStatus previousPaymentStatus = registration.getPaymentStatus();
        registration.setStatus(RegistrationStatus.CANCELLED);
        registration.setCancelledAt(LocalDateTime.now());
        registration.setCancelledByType(RegistrationActorType.PUBLIC.name());
        registration.setCancelledByLabel(email);
        registration.setCancellationReason("User cancelled their registration.");

        Registration saved = registrationRepository.save(registration);
        appendHistory(saved, "CANCELLED", "User cancelled their registration.",
                previousStatus, RegistrationStatus.CANCELLED,
                previousPaymentStatus, saved.getPaymentStatus(),
                RegistrationActorType.PUBLIC, email);
        return toPublicResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ManagedParticipantResponse> getProgramParticipants(Long programId) {
        return registrationRepository.findByProgramIdOrderByCreatedAtAsc(programId).stream()
                .filter(this::isRosterVisible)
                .map(this::toManagedParticipantResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ManagedParticipantResponse> getEventParticipants(Long eventId) {
        return registrationRepository.findByEventIdOrderByCreatedAtAsc(eventId).stream()
                .filter(this::isRosterVisible)
                .map(this::toManagedParticipantResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public long countProgramRoster(Long programId) {
        return registrationRepository.countProgramRosterRegistrations(
                programId, CAPACITY_HOLDING_STATUSES, RegistrationType.PROGRAM_BOOKING);
    }

    @Transactional(readOnly = true)
    public long countEventRoster(Long eventId) {
        return registrationRepository.countByEventIdAndStatusIn(eventId, CAPACITY_HOLDING_STATUSES);
    }

    @Transactional
    public RegistrationResponse updateStatus(Long id, RegistrationStatus nextStatus, String actorEmail) {
        Registration registration = getRegistrationEntity(id);
        RegistrationStatus previous = registration.getStatus();
        if (previous == nextStatus) {
            return toResponse(registration, true);
        }
        if (nextStatus == RegistrationStatus.CONFIRMED) {
            ensureCapacityAvailable(registration, id);
            registration.setConfirmedAt(LocalDateTime.now());
            registration.setWaitlistPosition(null);
            registration.setWaitlistedAt(null);
        }
        if (nextStatus == RegistrationStatus.COMPLETED) {
            registration.setCompletedAt(LocalDateTime.now());
        }
        registration.setStatus(nextStatus);
        Registration saved = registrationRepository.save(registration);
        appendHistory(saved, "STATUS_CHANGED", "Status changed from " + previous + " to " + nextStatus + ".",
                previous, nextStatus, null, null, RegistrationActorType.ADMIN, actorEmail);
        return toResponse(saved, true);
    }

    @Transactional
    public RegistrationResponse updatePaymentStatus(Long id, RegistrationPaymentStatus nextStatus, String actorEmail) {
        Registration registration = getRegistrationEntity(id);
        RegistrationPaymentStatus previous = registration.getPaymentStatus();
        registration.setPaymentStatus(nextStatus);
        if (nextStatus == RegistrationPaymentStatus.PAID) {
            registration.setAmountPaid(registration.getPriceAmount() != null ? registration.getPriceAmount() : BigDecimal.ZERO);
            if (registration.getStatus() == RegistrationStatus.PENDING) {
                ensureCapacityAvailable(registration, id);
                registration.setStatus(RegistrationStatus.CONFIRMED);
                registration.setConfirmedAt(LocalDateTime.now());
            }
        }
        if (nextStatus == RegistrationPaymentStatus.REFUNDED) {
            registration.setAmountPaid(BigDecimal.ZERO);
        }
        Registration saved = registrationRepository.save(registration);
        appendHistory(saved, "PAYMENT_STATUS_CHANGED", "Payment status changed from " + previous + " to " + nextStatus + ".",
                null, null, previous, nextStatus, RegistrationActorType.ADMIN, actorEmail);
        return toResponse(saved, true);
    }

    @Transactional
    public RegistrationResponse markStripeCheckoutPaid(Long registrationId, String stripeSessionId, String paymentIntentId) {
        Registration registration = getRegistrationEntity(registrationId);
        RegistrationPaymentStatus previousPaymentStatus = registration.getPaymentStatus();
        RegistrationStatus previousStatus = registration.getStatus();
        registration.setPaymentStatus(RegistrationPaymentStatus.PAID);
        registration.setAmountPaid(registration.getPriceAmount() != null ? registration.getPriceAmount() : BigDecimal.ZERO);
        if (registration.getStatus() == RegistrationStatus.PENDING) {
            ensureCapacityAvailable(registration, registration.getId());
            registration.setStatus(RegistrationStatus.CONFIRMED);
            registration.setConfirmedAt(LocalDateTime.now());
        }
        Registration saved = registrationRepository.save(registration);
        appendHistory(saved, "STRIPE_PAYMENT_CONFIRMED",
                "Stripe checkout payment confirmed for session " + stripeSessionId + ".",
                previousStatus, saved.getStatus(),
                previousPaymentStatus, saved.getPaymentStatus(),
                RegistrationActorType.SYSTEM, "stripe-webhook");
        sendProgramBookingNotice(saved);
        emailService.sendRegistrationConfirmation(toResponse(saved, false));
        return toResponse(saved, true);
    }

    @Transactional
    public RegistrationResponse cancelRegistration(Long id, String reason, String actorEmail, RegistrationActorType actorType) {
        Registration registration = getRegistrationEntity(id);
        RegistrationStatus previous = registration.getStatus();
        registration.setStatus(RegistrationStatus.CANCELLED);
        registration.setCancelledAt(LocalDateTime.now());
        registration.setCancelledByType(actorType.name());
        registration.setCancelledByLabel(actorEmail);
        registration.setCancellationReason(trim(reason));
        Registration saved = registrationRepository.save(registration);
        appendHistory(saved, "CANCELLED", StringUtils.hasText(reason) ? reason : "Registration cancelled.",
                previous, RegistrationStatus.CANCELLED, null, null, actorType, actorEmail);
        return toResponse(saved, true);
    }

    @Transactional
    public RegistrationResponse reschedule(Long id, RescheduleRegistrationRequest request, String actorEmail) {
        Registration registration = getRegistrationEntity(id);
        if (registration.getOfferingType() != RegistrationOfferingType.PROGRAM) {
            throw new IllegalArgumentException("Only program bookings can be rescheduled.");
        }
        String oldSlot = registration.getScheduledDate() + " " + registration.getScheduledStartTime();
        registration.setScheduledDate(request.getScheduledDate());
        registration.setScheduledStartTime(trim(request.getScheduledStartTime()));
        registration.setScheduledEndTime(trim(request.getScheduledEndTime()));
        registration.setTrainingSession(null);
        attachTrainingSessionIfNeeded(registration);
        ensureCapacityAvailable(registration, id);
        if (availabilityService.isSlotBlocked(registration.getScheduledDate(), registration.getScheduledStartTime())) {
            throw new SlotUnavailableException("The new time slot is not available.");
        }
        Registration saved = registrationRepository.save(registration);
        appendHistory(saved, "RESCHEDULED",
                "Moved from " + oldSlot + " to " + saved.getScheduledDate() + " " + saved.getScheduledStartTime() + ".",
                null, null, null, null, RegistrationActorType.ADMIN, actorEmail);
        return toResponse(saved, true);
    }

    private Registration buildFromRequest(RegistrationRequest request, RegistrationSource source) {
        Registration registration = buildBaseRegistration();
        applyRegistrationRequest(registration, request, source);
        return registration;
    }

    private void applyRegistrationRequest(Registration registration, RegistrationRequest request, RegistrationSource source) {
        registration.setRegistrationType(request.getRegistrationType() != null
                ? request.getRegistrationType()
                : (request.getEventId() != null ? RegistrationType.EVENT_REGISTRATION : RegistrationType.PROGRAM_BOOKING));
        registration.setStatus(request.getStatus() != null ? request.getStatus() : RegistrationStatus.CONFIRMED);
        registration.setPaymentStatus(request.getPaymentStatus() != null ? request.getPaymentStatus() : RegistrationPaymentStatus.UNPAID);
        registration.setSource(source);
        registration.setParticipantName(trim(request.getParticipantName()));
        registration.setParticipantAge(trim(request.getParticipantAge()));
        registration.setParticipantEmail(normalizeEmail(request.getParticipantEmail()));
        registration.setParticipantPhone(trim(request.getParticipantPhone()));
        registration.setGuardianName(trim(request.getGuardianName()));
        registration.setGuardianEmail(normalizeEmail(request.getGuardianEmail()));
        registration.setGuardianPhone(trim(request.getGuardianPhone()));
        registration.setEmergencyContactName(trim(request.getEmergencyContactName()));
        registration.setEmergencyContactPhone(trim(request.getEmergencyContactPhone()));
        registration.setMedicalNotes(trim(request.getMedicalNotes()));
        registration.setExperienceLevel(trim(request.getExperienceLevel()));
        registration.setScheduledDate(request.getScheduledDate());
        registration.setScheduledStartTime(trim(request.getScheduledStartTime()));
        registration.setScheduledEndTime(trim(request.getScheduledEndTime()));
        registration.setTimezone(StringUtils.hasText(request.getTimezone()) ? request.getTimezone().trim() : "America/Chicago");
        registration.setCurrency(StringUtils.hasText(request.getCurrency()) ? request.getCurrency().trim().toUpperCase(Locale.ROOT) : "USD");
        registration.setAmountPaid(request.getAmountPaid() != null ? request.getAmountPaid() : BigDecimal.ZERO);
        registration.setWaiverAccepted(request.isWaiverAccepted());
        if (request.isWaiverAccepted()) {
            registration.setWaiverAcceptedAt(LocalDateTime.now());
        }
        registration.setCustomerNotes(trim(request.getCustomerNotes()));
        registration.setAdminNotes(trim(request.getAdminNotes()));

        if (request.getTrainingSessionId() != null) {
            TrainingSession session = trainingSessionRepository.findByIdWithDetails(request.getTrainingSessionId())
                    .orElseThrow(() -> new ResourceNotFoundException("TrainingSession", request.getTrainingSessionId()));
            registration.setTrainingSession(session);
            registration.setProgram(session.getProgram());
            registration.setEvent(session.getEvent());
            registration.setScheduledDate(session.getScheduledDate());
            registration.setScheduledStartTime(session.getStartTime());
            registration.setScheduledEndTime(session.getEndTime());
            registration.setTimezone(StringUtils.hasText(session.getTimezone()) ? session.getTimezone() : registration.getTimezone());
            registration.setOfferingType(session.getEvent() != null ? RegistrationOfferingType.EVENT : RegistrationOfferingType.PROGRAM);
            if (session.getEvent() != null) {
                registration.setRegistrationType(RegistrationType.EVENT_REGISTRATION);
                registration.setPriceAmount(request.getPriceAmount() != null ? request.getPriceAmount() : session.getEvent().getPrice());
            } else if (session.getProgram() != null) {
                registration.setPriceAmount(request.getPriceAmount() != null ? request.getPriceAmount() : session.getProgram().getPrice());
            } else {
                throw new IllegalArgumentException("Training session must belong to a program or event.");
            }
        } else if (request.getProgramId() != null) {
            Program program = programRepository.findById(request.getProgramId())
                    .orElseThrow(() -> new ResourceNotFoundException("Program", request.getProgramId()));
            registration.setOfferingType(RegistrationOfferingType.PROGRAM);
            registration.setProgram(program);
            registration.setEvent(null);
            registration.setTrainingSession(null);
            registration.setPriceAmount(request.getPriceAmount() != null ? request.getPriceAmount() : program.getPrice());
        } else if (request.getEventId() != null) {
            Event event = eventRepository.findById(request.getEventId())
                    .orElseThrow(() -> new ResourceNotFoundException("Event", request.getEventId()));
            registration.setOfferingType(RegistrationOfferingType.EVENT);
            registration.setEvent(event);
            registration.setProgram(null);
            registration.setTrainingSession(null);
            registration.setPriceAmount(request.getPriceAmount() != null ? request.getPriceAmount() : event.getPrice());
        } else {
            throw new IllegalArgumentException("Registration requires a program or event.");
        }
    }

    private Registration saveWithCapacityDecision(Registration registration, String actorLabel) {
        validateBookable(registration);
        validateDuplicate(registration);
        attachTrainingSessionIfNeeded(registration);
        boolean capacityAvailable = isCapacityAvailable(registration, null);
        if (!capacityAvailable) {
            if (!allowWaitlist(registration)) {
                throw new SlotUnavailableException("This offering is full.");
            }
            registration.setStatus(RegistrationStatus.WAITLISTED);
            registration.setWaitlistedAt(LocalDateTime.now());
            registration.setWaitlistPosition(nextWaitlistPosition(registration));
        } else if (registration.getStatus() == RegistrationStatus.PENDING || registration.getStatus() == RegistrationStatus.CONFIRMED) {
            registration.setStatus(RegistrationStatus.CONFIRMED);
            registration.setConfirmedAt(LocalDateTime.now());
        }
        Registration saved = registrationRepository.save(registration);
        appendHistory(saved, saved.getStatus() == RegistrationStatus.WAITLISTED ? "WAITLISTED" : "CREATED",
                saved.getStatus() == RegistrationStatus.WAITLISTED
                        ? "Registration added to the waitlist."
                        : "Registration created.",
                null, saved.getStatus(), null, saved.getPaymentStatus(),
                saved.getSource() == RegistrationSource.ADMIN ? RegistrationActorType.ADMIN : RegistrationActorType.PUBLIC,
                actorLabel);
        return saved;
    }

    private void validateBookable(Registration registration) {
        if (registration.getOfferingType() == RegistrationOfferingType.PROGRAM) {
            Program program = registration.getProgram();
            if (!program.isActive() || "COMPLETED".equalsIgnoreCase(program.getStatus())) {
                throw new IllegalArgumentException("This program is not currently bookable.");
            }
            if (registration.getRegistrationType() == RegistrationType.PROGRAM_BOOKING) {
                if (registration.getScheduledDate() == null || !StringUtils.hasText(registration.getScheduledStartTime())) {
                    throw new IllegalArgumentException("Program bookings require a date and time.");
                }
                if (availabilityService.isSlotBlocked(registration.getScheduledDate(), registration.getScheduledStartTime())) {
                    throw new SlotUnavailableException("This time slot is not available.");
                }
            }
            return;
        }

        Event event = registration.getEvent();
        if (!event.isActive() || "COMPLETED".equalsIgnoreCase(event.getStatus())) {
            throw new IllegalArgumentException("This event is not currently accepting registrations.");
        }
        TrainingSession session = registration.getTrainingSession();
        if (session != null && session.getStatus() == com.kanteelite.training.enums.TrainingSessionStatus.CANCELLED) {
            throw new IllegalArgumentException("This training session is not currently accepting registrations.");
        }
    }

    private void validateDuplicate(Registration registration) {
        String email = registration.getGuardianEmail();
        if (!StringUtils.hasText(email)) {
            throw new IllegalArgumentException("Guardian email is required.");
        }
        if (registration.getOfferingType() == RegistrationOfferingType.EVENT
                && registration.getTrainingSession() != null
                && registrationRepository.existsByEventIdAndTrainingSessionIdAndGuardianEmailIgnoreCaseAndStatusNot(
                registration.getEvent().getId(), registration.getTrainingSession().getId(), email, RegistrationStatus.CANCELLED)) {
            throw new IllegalArgumentException("That email is already registered for this session.");
        }
        if (registration.getOfferingType() == RegistrationOfferingType.EVENT
                && registration.getTrainingSession() == null
                && registrationRepository.existsByEventIdAndGuardianEmailIgnoreCaseAndStatusNot(
                registration.getEvent().getId(), email, RegistrationStatus.CANCELLED)) {
            throw new IllegalArgumentException("That email is already registered for this event.");
        }
        if (registration.getOfferingType() == RegistrationOfferingType.PROGRAM
                && registration.getRegistrationType() != RegistrationType.PROGRAM_BOOKING
                && registrationRepository.existsByProgramIdAndGuardianEmailIgnoreCaseAndRegistrationTypeAndStatusNot(
                registration.getProgram().getId(), email, registration.getRegistrationType(), RegistrationStatus.CANCELLED)) {
            throw new IllegalArgumentException("That email is already registered for this program.");
        }
    }

    private boolean isCapacityAvailable(Registration registration, Long currentRegistrationId) {
        if (registration.getOfferingType() == RegistrationOfferingType.EVENT) {
            if (registration.getTrainingSession() != null && registration.getTrainingSession().getId() != null) {
                long used = registrationRepository.countByTrainingSessionIdAndStatusIn(
                        registration.getTrainingSession().getId(), CAPACITY_HOLDING_STATUSES);
                if (currentRegistrationId != null && CAPACITY_HOLDING_STATUSES.contains(registration.getStatus())) {
                    used = Math.max(0, used - 1);
                }
                int capacity = resolveCapacity(registration.getTrainingSession().getCapacity());
                return used < capacity;
            }
            int capacity = resolveCapacity(registration.getEvent().getCapacity());
            long used = registrationRepository.countByEventIdAndStatusIn(registration.getEvent().getId(), CAPACITY_HOLDING_STATUSES);
            if (currentRegistrationId != null && CAPACITY_HOLDING_STATUSES.contains(registration.getStatus())) {
                used = Math.max(0, used - 1);
            }
            return used < capacity;
        }

        if (registration.getRegistrationType() == RegistrationType.PROGRAM_BOOKING) {
            TrainingSession session = registration.getTrainingSession();
            if (session != null && session.getId() != null) {
                long used = registrationRepository.countByTrainingSessionIdAndStatusIn(
                        session.getId(), CAPACITY_HOLDING_STATUSES);
                if (currentRegistrationId != null && CAPACITY_HOLDING_STATUSES.contains(registration.getStatus())) {
                    used = Math.max(0, used - 1);
                }
                int capacity = resolveCapacity(session.getCapacity());
                return used < capacity;
            }
            if (currentRegistrationId == null) {
                return registrationRepository.countByProgramIdAndScheduledDateAndScheduledStartTimeAndStatusIn(
                        registration.getProgram().getId(),
                        registration.getScheduledDate(),
                        registration.getScheduledStartTime(),
                        CAPACITY_HOLDING_STATUSES) < 1;
            }
            return !registrationRepository.existsByProgramIdAndScheduledDateAndScheduledStartTimeAndStatusInAndIdNot(
                    registration.getProgram().getId(),
                    registration.getScheduledDate(),
                    registration.getScheduledStartTime(),
                    CAPACITY_HOLDING_STATUSES,
                    currentRegistrationId);
        }

        int capacity = resolveCapacity(registration.getProgram().getCapacity());
        long used = registrationRepository.countProgramRosterRegistrations(
                registration.getProgram().getId(), CAPACITY_HOLDING_STATUSES, RegistrationType.PROGRAM_BOOKING);
        return used < capacity;
    }

    private void attachTrainingSessionIfNeeded(Registration registration) {
        if (registration.getOfferingType() != RegistrationOfferingType.PROGRAM
                || registration.getRegistrationType() != RegistrationType.PROGRAM_BOOKING
                || registration.getTrainingSession() != null) {
            return;
        }
        if (registration.getProgram() == null
                || registration.getScheduledDate() == null
                || !StringUtils.hasText(registration.getScheduledStartTime())) {
            return;
        }
        registration.setTrainingSession(trainingSessionService.findOrCreateSession(
                registration.getProgram(),
                registration.getScheduledDate(),
                registration.getScheduledStartTime(),
                resolveCapacity(registration.getProgram().getCapacity())));
    }

    private void ensureCapacityAvailable(Registration registration, Long currentRegistrationId) {
        if (!isCapacityAvailable(registration, currentRegistrationId)) {
            throw new SlotUnavailableException("Capacity has been reached.");
        }
    }

    private boolean allowWaitlist(Registration registration) {
        return registration.getOfferingType() == RegistrationOfferingType.EVENT
                ? registration.getEvent().isAllowWaitlist()
                : registration.getProgram().isAllowWaitlist();
    }

    private int nextWaitlistPosition(Registration registration) {
        if (registration.getOfferingType() == RegistrationOfferingType.EVENT) {
            return registrationRepository.countByOfferingTypeAndEventIdAndStatus(
                    RegistrationOfferingType.EVENT, registration.getEvent().getId(), RegistrationStatus.WAITLISTED) + 1;
        }
        return registrationRepository.countByOfferingTypeAndProgramIdAndStatus(
                RegistrationOfferingType.PROGRAM, registration.getProgram().getId(), RegistrationStatus.WAITLISTED) + 1;
    }

    private void applyParticipantAssignment(Registration registration, ParticipantAssignmentRequest request) {
        if (request.getUserId() != null) {
            User user = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", request.getUserId()));
            registration.setParticipantName(user.getName());
            registration.setGuardianName(user.getName());
            registration.setGuardianEmail(normalizeEmail(user.getEmail()));
            registration.setParticipantEmail(normalizeEmail(user.getEmail()));
            return;
        }
        if (request.getPlayerProfileId() != null) {
            PlayerProfile playerProfile = playerProfileRepository.findById(request.getPlayerProfileId())
                    .orElseThrow(() -> new ResourceNotFoundException("PlayerProfile", request.getPlayerProfileId()));
            User parent = playerProfile.getParentUser();
            registration.setParticipantName(playerProfile.getName());
            registration.setParticipantAge(playerProfile.getAge() != null ? String.valueOf(playerProfile.getAge()) : null);
            if (parent != null) {
                registration.setGuardianName(parent.getName());
                registration.setGuardianEmail(normalizeEmail(parent.getEmail()));
            }
            return;
        }
        String manualName = trim(request.getManualName());
        String manualEmail = normalizeEmail(request.getManualEmail());
        if (!StringUtils.hasText(manualName) || !StringUtils.hasText(manualEmail)) {
            throw new IllegalArgumentException("Manual participants need both a name and email.");
        }
        registration.setParticipantName(manualName);
        registration.setGuardianEmail(manualEmail);
    }

    private Registration getRegistrationEntity(Long id) {
        return registrationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Registration", id));
    }

    private Registration buildBaseRegistration() {
        return Registration.builder()
                .registrationCode(generateCode())
                .status(RegistrationStatus.PENDING)
                .paymentStatus(RegistrationPaymentStatus.UNPAID)
                .source(RegistrationSource.PUBLIC)
                .timezone("America/Chicago")
                .currency("USD")
                .amountPaid(BigDecimal.ZERO)
                .build();
    }

    private String generateCode() {
        return "REG-" + UUID.randomUUID().toString().replace("-", "").substring(0, 10).toUpperCase(Locale.ROOT);
    }

    private RegistrationPaymentStatus resolvePaymentStatus(BigDecimal price) {
        return price == null || price.compareTo(BigDecimal.ZERO) <= 0
                ? RegistrationPaymentStatus.NOT_REQUIRED
                : RegistrationPaymentStatus.UNPAID;
    }

    private int resolveCapacity(Integer capacity) {
        return capacity != null && capacity > 0 ? capacity : 20;
    }

    private boolean isRosterVisible(Registration registration) {
        return registration.getStatus() != RegistrationStatus.CANCELLED
                && registration.getStatus() != RegistrationStatus.NO_SHOW;
    }

    private ManagedParticipantResponse toManagedParticipantResponse(Registration registration) {
        return ManagedParticipantResponse.builder()
                .id(registration.getId())
                .participantType(registration.getStatus() == RegistrationStatus.WAITLISTED ? "WAITLISTED" : "REGISTRATION")
                .name(registration.getParticipantName())
                .email(registration.getGuardianEmail())
                .createdAt(registration.getCreatedAt())
                .build();
    }

    public RegistrationResponse toResponse(Registration registration, boolean includeHistory) {
        Program program = registration.getProgram();
        Event event = registration.getEvent();
        TrainingSession trainingSession = registration.getTrainingSession();
        Program displayProgram = program != null
                ? program
                : (trainingSession != null ? trainingSession.getProgram() : null);
        PaymentRecord paymentRecord = paymentRecordRepository
                .findFirstByRegistrationIdOrderByCreatedAtDesc(registration.getId())
                .orElse(null);
        return RegistrationResponse.builder()
                .id(registration.getId())
                .registrationCode(registration.getRegistrationCode())
                .offeringType(registration.getOfferingType())
                .programId(displayProgram != null ? displayProgram.getId() : null)
                .programName(displayProgram != null ? displayProgram.getName() : null)
                .programSlug(displayProgram != null ? displayProgram.getSlug() : null)
                .trainingSessionId(trainingSession != null ? trainingSession.getId() : null)
                .sessionCoachLabel(resolveSessionCoachLabel(trainingSession))
                .sessionLocation(trainingSession != null ? trainingSession.getLocation() : null)
                .eventId(event != null ? event.getId() : null)
                .eventTitle(event != null ? event.getTitle() : null)
                .registrationType(registration.getRegistrationType())
                .status(registration.getStatus())
                .paymentStatus(registration.getPaymentStatus())
                .source(registration.getSource())
                .participantName(registration.getParticipantName())
                .participantAge(registration.getParticipantAge())
                .participantEmail(registration.getParticipantEmail())
                .participantPhone(registration.getParticipantPhone())
                .guardianName(registration.getGuardianName())
                .guardianEmail(registration.getGuardianEmail())
                .guardianPhone(registration.getGuardianPhone())
                .emergencyContactName(registration.getEmergencyContactName())
                .emergencyContactPhone(registration.getEmergencyContactPhone())
                .medicalNotes(registration.getMedicalNotes())
                .experienceLevel(registration.getExperienceLevel())
                .scheduledDate(registration.getScheduledDate())
                .scheduledStartTime(registration.getScheduledStartTime())
                .scheduledEndTime(registration.getScheduledEndTime())
                .timezone(registration.getTimezone())
                .priceAmount(registration.getPriceAmount())
                .currency(registration.getCurrency())
                .amountPaid(registration.getAmountPaid())
                .waiverAccepted(registration.isWaiverAccepted())
                .customerNotes(registration.getCustomerNotes())
                .adminNotes(registration.getAdminNotes())
                .waitlistPosition(registration.getWaitlistPosition())
                .waitlistedAt(registration.getWaitlistedAt())
                .cancelledAt(registration.getCancelledAt())
                .cancelledByType(registration.getCancelledByType())
                .cancelledByLabel(registration.getCancelledByLabel())
                .cancellationReason(registration.getCancellationReason())
                .confirmedAt(registration.getConfirmedAt())
                .completedAt(registration.getCompletedAt())
                .paymentRecordId(paymentRecord != null ? paymentRecord.getId() : null)
                .paymentProvider(paymentRecord != null ? paymentRecord.getProvider() : null)
                .stripeSessionId(paymentRecord != null ? paymentRecord.getStripeSessionId() : null)
                .paymentIntentId(paymentRecord != null ? paymentRecord.getPaymentIntentId() : null)
                .paymentAmount(paymentRecord != null ? paymentRecord.getAmount() : null)
                .amountRefunded(paymentRecord != null ? paymentRecord.getAmountRefunded() : BigDecimal.ZERO)
                .paymentRefundable(paymentRecord != null
                        && paymentRecord.getStatus() == RegistrationPaymentStatus.PAID
                        && StringUtils.hasText(paymentRecord.getStripeSessionId()))
                .confirmationEmailAvailable(emailService.isEmailDeliveryAvailable())
                .createdAt(registration.getCreatedAt())
                .updatedAt(registration.getUpdatedAt())
                .history(includeHistory ? getHistory(registration.getId()) : List.of())
                .build();
    }

    private String resolveSessionCoachLabel(TrainingSession trainingSession) {
        if (trainingSession == null) {
            return null;
        }
        if (StringUtils.hasText(trainingSession.getCoachLabel())) {
            return trainingSession.getCoachLabel();
        }
        User coachUser = trainingSession.getCoachUser();
        return coachUser != null ? coachUser.getName() : null;
    }

    private RegistrationResponse toPublicResponse(Registration registration) {
        RegistrationResponse response = toResponse(registration, false);
        response.setAdminNotes(null);
        return response;
    }

    private boolean isRegistrationOwner(Registration registration, String email) {
        return email != null && (email.equals(normalizeEmail(registration.getGuardianEmail()))
                || email.equals(normalizeEmail(registration.getParticipantEmail())));
    }

    private List<RegistrationHistoryResponse> getHistory(Long registrationId) {
        return historyRepository.findByRegistrationIdOrderByCreatedAtDesc(registrationId).stream()
                .map(history -> RegistrationHistoryResponse.builder()
                        .id(history.getId())
                        .eventType(history.getEventType())
                        .message(history.getMessage())
                        .previousStatus(history.getPreviousStatus())
                        .newStatus(history.getNewStatus())
                        .previousPaymentStatus(history.getPreviousPaymentStatus())
                        .newPaymentStatus(history.getNewPaymentStatus())
                        .actorType(history.getActorType())
                        .actorLabel(history.getActorLabel())
                        .createdAt(history.getCreatedAt())
                        .build())
                .toList();
    }

    private void appendHistory(
            Registration registration,
            String eventType,
            String message,
            RegistrationStatus previousStatus,
            RegistrationStatus newStatus,
            RegistrationPaymentStatus previousPaymentStatus,
            RegistrationPaymentStatus newPaymentStatus,
            RegistrationActorType actorType,
            String actorLabel
    ) {
        historyRepository.save(RegistrationHistory.builder()
                .registration(registration)
                .eventType(eventType)
                .message(message)
                .previousStatus(previousStatus)
                .newStatus(newStatus)
                .previousPaymentStatus(previousPaymentStatus)
                .newPaymentStatus(newPaymentStatus)
                .actorType(actorType)
                .actorLabel(actorLabel)
                .build());
    }

    private String trim(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }

    private String normalizeEmail(String value) {
        String trimmed = trim(value);
        return trimmed == null ? null : trimmed.toLowerCase(Locale.ROOT);
    }

    private void sendEventRegistrationNotice(Registration registration) {
        if (!StringUtils.hasText(registration.getGuardianEmail()) || registration.getEvent() == null) {
            return;
        }
        notificationService.send(
                registration.getGuardianEmail(),
                "EVENT_REGISTRATION",
                registration.getStatus() == RegistrationStatus.WAITLISTED ? "Event waitlist joined" : "Event registration confirmed",
                registration.getStatus() == RegistrationStatus.WAITLISTED
                        ? "You have joined the waitlist for " + registration.getEvent().getTitle() + "."
                        : "You have been registered for " + registration.getEvent().getTitle() + ".",
                "Registration",
                registration.getId());
        emailService.sendEventParticipantEmail(
                registration.getGuardianEmail(),
                registration.getParticipantName(),
                registration.getEvent().getTitle(),
                true);
    }

    private void sendProgramBookingNotice(Registration registration) {
        if (!StringUtils.hasText(registration.getGuardianEmail()) || registration.getProgram() == null) {
            return;
        }
        notificationService.send(
                registration.getGuardianEmail(),
                "PROGRAM_BOOKING",
                registration.getStatus() == RegistrationStatus.WAITLISTED ? "Training waitlist joined" : "Training session confirmed",
                registration.getStatus() == RegistrationStatus.WAITLISTED
                        ? "You have joined the waitlist for " + registration.getProgram().getName() + "."
                        : "Your session for " + registration.getProgram().getName() + " on "
                                + registration.getScheduledDate() + " at " + registration.getScheduledStartTime()
                                + " has been confirmed.",
                "Registration",
                registration.getId());
    }

}
