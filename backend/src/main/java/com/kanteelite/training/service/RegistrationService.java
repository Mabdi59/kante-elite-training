package com.kanteelite.training.service;

import com.kanteelite.training.dto.request.RegistrationRequest;
import com.kanteelite.training.dto.response.RegistrationResponse;
import com.kanteelite.training.entity.PlayerProfile;
import com.kanteelite.training.entity.Registration;
import com.kanteelite.training.entity.Session;
import com.kanteelite.training.entity.User;
import com.kanteelite.training.enums.RegistrationStatus;
import com.kanteelite.training.enums.SessionStatus;
import com.kanteelite.training.exception.ResourceNotFoundException;
import com.kanteelite.training.repository.PlayerProfileRepository;
import com.kanteelite.training.repository.RegistrationRepository;
import com.kanteelite.training.repository.SessionRepository;
import com.kanteelite.training.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class RegistrationService {

    private final RegistrationRepository registrationRepository;
    private final SessionRepository sessionRepository;
    private final PlayerProfileRepository playerProfileRepository;
    private final UserRepository userRepository;

    @Transactional
    public RegistrationResponse register(Long sessionId, RegistrationRequest request, String userEmail) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session", sessionId));
        if (session.getStatus() != SessionStatus.SCHEDULED) {
            throw new IllegalArgumentException("Session is not open for registrations.");
        }

        PlayerProfile playerProfile = null;
        if (request.getPlayerProfileId() != null) {
            playerProfile = playerProfileRepository.findById(request.getPlayerProfileId())
                    .orElseThrow(() -> new ResourceNotFoundException("PlayerProfile", request.getPlayerProfileId()));
            if (registrationRepository.existsBySessionIdAndPlayerProfileIdAndStatusNot(
                    sessionId, playerProfile.getId(), RegistrationStatus.CANCELLED)) {
                throw new IllegalArgumentException("Player is already registered for this session.");
            }
        }

        User user = null;
        if (userEmail != null && !userEmail.isBlank()) {
            user = userRepository.findByEmailIgnoreCase(userEmail).orElse(null);
        }

        boolean atCapacity = session.getRegisteredCount() != null && session.getCapacity() != null
                && session.getRegisteredCount() >= session.getCapacity();
        RegistrationStatus status = atCapacity ? RegistrationStatus.WAITLISTED : RegistrationStatus.CONFIRMED;

        Registration registration = Registration.builder()
                .session(session)
                .playerProfile(playerProfile)
                .user(user)
                .status(status)
                .notes(request.getNotes())
                .build();
        Registration saved = registrationRepository.save(registration);

        if (status == RegistrationStatus.CONFIRMED) {
            session.setRegisteredCount((session.getRegisteredCount() != null ? session.getRegisteredCount() : 0) + 1);
            sessionRepository.save(session);
        }
        return toResponse(saved);
    }

    @Transactional
    public RegistrationResponse updateStatus(Long registrationId, String statusRaw) {
        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new ResourceNotFoundException("Registration", registrationId));
        RegistrationStatus previous = registration.getStatus();
        RegistrationStatus next = RegistrationStatus.valueOf(statusRaw.trim().toUpperCase(Locale.ROOT));
        if (previous == next) {
            return toResponse(registration);
        }

        Session session = registration.getSession();
        int currentRegistered = session.getRegisteredCount() != null ? session.getRegisteredCount() : 0;
        if (previous == RegistrationStatus.CONFIRMED && next != RegistrationStatus.CONFIRMED) {
            session.setRegisteredCount(Math.max(currentRegistered - 1, 0));
        } else if (previous != RegistrationStatus.CONFIRMED && next == RegistrationStatus.CONFIRMED) {
            if (session.getCapacity() != null && currentRegistered >= session.getCapacity()) {
                throw new IllegalArgumentException("Session is already full.");
            }
            session.setRegisteredCount(currentRegistered + 1);
        }

        registration.setStatus(next);
        registrationRepository.save(registration);
        sessionRepository.save(session);
        maybePromoteWaitlist(session.getId());
        return toResponse(registration);
    }

    @Transactional
    public void cancelRegistration(Long registrationId) {
        updateStatus(registrationId, RegistrationStatus.CANCELLED.name());
    }

    @Transactional(readOnly = true)
    public List<RegistrationResponse> getRegistrationsForSession(Long sessionId) {
        return registrationRepository.findBySessionIdOrderByRegisteredAtAsc(sessionId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<RegistrationResponse> getAllRegistrations() {
        return registrationRepository.findAllByOrderByRegisteredAtDesc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public void deleteRegistration(Long registrationId) {
        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new ResourceNotFoundException("Registration", registrationId));
        Session session = registration.getSession();
        if (registration.getStatus() == RegistrationStatus.CONFIRMED) {
            session.setRegisteredCount(Math.max((session.getRegisteredCount() != null ? session.getRegisteredCount() : 0) - 1, 0));
            sessionRepository.save(session);
        }
        registrationRepository.delete(registration);
        maybePromoteWaitlist(session.getId());
    }

    private void maybePromoteWaitlist(Long sessionId) {
        Session session = sessionRepository.findById(sessionId).orElse(null);
        if (session == null) {
            return;
        }
        int currentRegistered = session.getRegisteredCount() != null ? session.getRegisteredCount() : 0;
        int capacity = session.getCapacity() != null ? session.getCapacity() : 20;
        if (currentRegistered >= capacity) {
            return;
        }
        registrationRepository.findFirstBySessionIdAndStatusOrderByRegisteredAtAsc(sessionId, RegistrationStatus.WAITLISTED)
                .ifPresent(waitlisted -> {
                    waitlisted.setStatus(RegistrationStatus.CONFIRMED);
                    registrationRepository.save(waitlisted);
                    session.setRegisteredCount(currentRegistered + 1);
                    sessionRepository.save(session);
                });
    }

    private RegistrationResponse toResponse(Registration registration) {
        return RegistrationResponse.builder()
                .id(registration.getId())
                .sessionId(registration.getSession() != null ? registration.getSession().getId() : null)
                .playerProfileId(registration.getPlayerProfile() != null ? registration.getPlayerProfile().getId() : null)
                .playerName(registration.getPlayerProfile() != null ? registration.getPlayerProfile().getName() : null)
                .userId(registration.getUser() != null ? registration.getUser().getId() : null)
                .userEmail(registration.getUser() != null ? registration.getUser().getEmail() : null)
                .status(registration.getStatus() != null ? registration.getStatus().name() : null)
                .notes(registration.getNotes())
                .registeredAt(registration.getRegisteredAt())
                .build();
    }
}
