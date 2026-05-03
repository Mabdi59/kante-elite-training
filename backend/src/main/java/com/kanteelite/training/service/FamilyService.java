package com.kanteelite.training.service;

import com.kanteelite.training.dto.request.FamilyOnboardingRequest;
import com.kanteelite.training.dto.response.AdminFamiliesListResponse;
import com.kanteelite.training.dto.response.FamilyDetailResponse;
import com.kanteelite.training.dto.response.SessionSeriesResponse;
import com.kanteelite.training.entity.PlayerProfile;
import com.kanteelite.training.entity.Registration;
import com.kanteelite.training.entity.SessionSeries;
import com.kanteelite.training.entity.TrainingSession;
import com.kanteelite.training.entity.User;
import com.kanteelite.training.enums.RegistrationStatus;
import com.kanteelite.training.enums.TrainingSessionStatus;
import com.kanteelite.training.enums.UserRole;
import com.kanteelite.training.exception.ResourceNotFoundException;
import com.kanteelite.training.repository.PlayerProfileRepository;
import com.kanteelite.training.repository.RegistrationRepository;
import com.kanteelite.training.repository.SessionSeriesRepository;
import com.kanteelite.training.repository.TrainingSessionRepository;
import com.kanteelite.training.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class FamilyService {

    private static final Set<RegistrationStatus> ACTIVE_REGISTRATION_STATUSES = Set.of(
            RegistrationStatus.PENDING,
            RegistrationStatus.CONFIRMED,
            RegistrationStatus.WAITLISTED
    );

    private final UserRepository userRepository;
    private final PlayerProfileRepository playerProfileRepository;
    private final RegistrationRepository registrationRepository;
    private final SessionSeriesRepository sessionSeriesRepository;
    private final TrainingSessionRepository trainingSessionRepository;
    private final PasswordEncoder passwordEncoder;

    public FamilyDetailResponse onboardFamily(FamilyOnboardingRequest request, String actorEmail) {
        User parent;

        if (request.getExistingParentUserId() != null) {
            parent = userRepository.findById(request.getExistingParentUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", request.getExistingParentUserId()));
        } else {
            String parentEmail = request.getParentEmail() != null
                    ? request.getParentEmail().trim().toLowerCase()
                    : null;
            if (userRepository.existsByEmail(parentEmail)) {
                parent = userRepository.findByEmail(parentEmail)
                        .orElseThrow(() -> new ResourceNotFoundException("User not found: " + parentEmail));
            } else {
                String rawPassword = request.getParentPassword() != null
                        ? request.getParentPassword()
                        : UUID.randomUUID().toString().substring(0, 12);
                log.info("Creating new parent user {} with generated password", parentEmail);
                parent = User.builder()
                        .name(request.getParentName())
                        .email(parentEmail)
                        .password(passwordEncoder.encode(rawPassword))
                        .role(UserRole.PARENT)
                        .phone(request.getParentPhone())
                        .emergencyContact(request.getEmergencyContact())
                        .build();
                parent = userRepository.save(parent);
            }
        }

        if (request.getParentPhone() != null) {
            parent.setPhone(request.getParentPhone());
        }
        if (request.getEmergencyContact() != null) {
            parent.setEmergencyContact(request.getEmergencyContact());
        }
        if (request.getParentName() != null && !request.getParentName().isBlank()) {
            parent.setName(request.getParentName());
        }
        parent = userRepository.save(parent);

        if (request.getPlayers() != null) {
            for (FamilyOnboardingRequest.PlayerOnboardingEntry entry : request.getPlayers()) {
                PlayerProfile profile = PlayerProfile.builder()
                        .parentUser(parent)
                        .name(entry.getName())
                        .age(resolveAge(entry.getDateOfBirth(), entry.getAge()))
                        .skillLevel(entry.getSkillLevel())
                        .preferredPosition(entry.getPreferredPosition())
                        .notes(entry.getNotes())
                        .active(entry.getActive() == null || entry.getActive())
                        .build();
                if (entry.getDateOfBirth() != null && !entry.getDateOfBirth().isBlank()) {
                    profile.setDateOfBirth(LocalDate.parse(entry.getDateOfBirth()));
                }
                playerProfileRepository.save(profile);
            }
        }

        return buildFamilyDetail(parent);
    }

    @Transactional(readOnly = true)
    public FamilyDetailResponse getFamily(Long parentUserId) {
        User parent = userRepository.findById(parentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", parentUserId));
        return buildFamilyDetail(parent);
    }

    @Transactional(readOnly = true)
    public List<AdminFamiliesListResponse> getFamilies() {
        return userRepository.findByRoleOrderByNameAsc(UserRole.PARENT).stream()
                .map(this::toAdminFamilyListItem)
                .collect(Collectors.toList());
    }

    public FamilyDetailResponse updateFamilyParent(Long parentUserId, FamilyOnboardingRequest request, String actorEmail) {
        User parent = userRepository.findById(parentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", parentUserId));
        if (request.getParentName() != null && !request.getParentName().isBlank()) {
            parent.setName(request.getParentName());
        }
        if (request.getParentPhone() != null) {
            parent.setPhone(request.getParentPhone());
        }
        if (request.getEmergencyContact() != null) {
            parent.setEmergencyContact(request.getEmergencyContact());
        }
        userRepository.save(parent);
        return buildFamilyDetail(parent);
    }

    private AdminFamiliesListResponse toAdminFamilyListItem(User parent) {
        long playerCount = playerProfileRepository.countByParentUserId(parent.getId());
        long upcomingSessionCount = registrationRepository.findAccountHistoryByEmail(parent.getEmail())
                .stream()
                .filter(this::isUpcomingActiveRegistration)
                .count();
        return AdminFamiliesListResponse.builder()
                .id(parent.getId())
                .name(parent.getName())
                .email(parent.getEmail())
                .phone(parent.getPhone())
                .createdAt(parent.getCreatedAt())
                .playerCount(playerCount)
                .upcomingSessionCount(upcomingSessionCount)
                .build();
    }

    private FamilyDetailResponse buildFamilyDetail(User parent) {
        List<PlayerProfile> profiles = playerProfileRepository.findByParentUserIdOrderByNameAsc(parent.getId());

        List<FamilyDetailResponse.PlayerSummary> playerSummaries = profiles.stream()
                .map(p -> FamilyDetailResponse.PlayerSummary.builder()
                        .id(p.getId())
                        .name(p.getName())
                        .age(resolveAge(p.getDateOfBirth() != null ? p.getDateOfBirth().toString() : null, p.getAge()))
                        .skillLevel(p.getSkillLevel())
                        .preferredPosition(p.getPreferredPosition())
                        .active(p.isActive())
                        .build())
                .collect(Collectors.toList());

        List<Registration> registrations = registrationRepository.findAccountHistoryByEmail(parent.getEmail());
        int totalBookings = registrations.size();
        int upcomingBookings = (int) registrations.stream().filter(this::isUpcomingActiveRegistration).count();
        int completedBookings = (int) registrations.stream()
                .filter(registration -> registration.getStatus() == RegistrationStatus.COMPLETED)
                .count();

        List<FamilyDetailResponse.RecentBookingItem> recentBookings = registrations.stream()
                .limit(10)
                .map(registration -> FamilyDetailResponse.RecentBookingItem.builder()
                        .id(registration.getId())
                        .date(registration.getScheduledDate())
                        .time(registration.getScheduledStartTime())
                        .programName(registration.getProgram() != null ? registration.getProgram().getName() : null)
                        .status(registration.getStatus().name())
                        .playerName(registration.getParticipantName())
                        .build())
                .collect(Collectors.toList());

        List<Long> playerIds = profiles.stream().map(PlayerProfile::getId).collect(Collectors.toList());
        List<SessionSeriesResponse> seriesResponses = playerIds.isEmpty()
                ? List.of()
                : sessionSeriesRepository.findActiveSeriesByPlayerIds(playerIds).stream()
                        .map(this::toSeriesResponse)
                        .collect(Collectors.toList());

        return FamilyDetailResponse.builder()
                .parentId(parent.getId())
                .parentName(parent.getName())
                .parentEmail(parent.getEmail())
                .parentPhone(parent.getPhone())
                .emergencyContact(parent.getEmergencyContact())
                .players(playerSummaries)
                .activeSeries(seriesResponses)
                .totalBookings(totalBookings)
                .upcomingBookings(upcomingBookings)
                .completedBookings(completedBookings)
                .recentBookings(recentBookings)
                .build();
    }

    private SessionSeriesResponse toSeriesResponse(SessionSeries series) {
        List<TrainingSession> sessions = trainingSessionRepository
                .findBySessionSeriesIdOrderByScheduledDateAscStartTimeAsc(series.getId());
        LocalDate today = LocalDate.now();
        int completed = (int) sessions.stream()
                .filter(session -> session.getStatus() == TrainingSessionStatus.COMPLETED
                        || (session.getScheduledDate() != null && session.getScheduledDate().isBefore(today)))
                .count();
        int upcoming = (int) sessions.stream()
                .filter(session -> session.getScheduledDate() != null && !session.getScheduledDate().isBefore(today)
                        && session.getStatus() != TrainingSessionStatus.CANCELLED)
                .count();
        int cancelled = (int) sessions.stream()
                .filter(session -> session.getStatus() == TrainingSessionStatus.CANCELLED)
                .count();

        List<SessionSeriesResponse.PlayerSummary> playerSummaries = series.getPlayers().stream()
                .map(player -> SessionSeriesResponse.PlayerSummary.builder()
                        .id(player.getId())
                        .name(player.getName())
                        .parentUserEmail(player.getParentUser() != null ? player.getParentUser().getEmail() : null)
                        .build())
                .collect(Collectors.toList());

        return SessionSeriesResponse.builder()
                .id(series.getId())
                .coachUserId(series.getCoachUser() != null ? series.getCoachUser().getId() : null)
                .coachName(series.getCoachUser() != null ? series.getCoachUser().getName() : null)
                .coachEmail(series.getCoachUser() != null ? series.getCoachUser().getEmail() : null)
                .programId(series.getProgram() != null ? series.getProgram().getId() : null)
                .programName(series.getProgram() != null ? series.getProgram().getName() : null)
                .title(series.getTitle())
                .startDate(series.getStartDate())
                .endDate(series.getEndDate())
                .weekdays(series.getWeekdays())
                .startTime(series.getStartTime())
                .durationMinutes(series.getDurationMinutes())
                .capacity(series.getCapacity())
                .location(series.getLocation())
                .notes(series.getNotes())
                .active(series.isActive())
                .createdAt(series.getCreatedAt())
                .updatedAt(series.getUpdatedAt())
                .players(playerSummaries)
                .totalSessions(sessions.size())
                .completedSessions(completed)
                .upcomingSessions(upcoming)
                .cancelledSessions(cancelled)
                .build();
    }

    private boolean isUpcomingActiveRegistration(Registration registration) {
        return registration.getScheduledDate() != null
                && !registration.getScheduledDate().isBefore(LocalDate.now())
                && ACTIVE_REGISTRATION_STATUSES.contains(registration.getStatus());
    }

    private Integer resolveAge(String dateOfBirth, Integer fallbackAge) {
        if (dateOfBirth == null || dateOfBirth.isBlank()) {
            return fallbackAge;
        }

        LocalDate dob = LocalDate.parse(dateOfBirth);
        LocalDate today = LocalDate.now();
        if (dob.isAfter(today)) {
            return fallbackAge;
        }

        return Period.between(dob, today).getYears();
    }
}
