package com.kanteelite.training.service;

import com.kanteelite.training.dto.request.FamilyOnboardingRequest;
import com.kanteelite.training.dto.response.AdminFamiliesListResponse;
import com.kanteelite.training.dto.response.BookingSeriesResponse;
import com.kanteelite.training.dto.response.FamilyDetailResponse;
import com.kanteelite.training.entity.Booking;
import com.kanteelite.training.entity.BookingSeries;
import com.kanteelite.training.entity.PlayerProfile;
import com.kanteelite.training.entity.User;
import com.kanteelite.training.enums.BookingStatus;
import com.kanteelite.training.enums.UserRole;
import com.kanteelite.training.exception.ResourceNotFoundException;
import com.kanteelite.training.repository.BookingRepository;
import com.kanteelite.training.repository.BookingSeriesRepository;
import com.kanteelite.training.repository.PlayerProfileRepository;
import com.kanteelite.training.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class FamilyService {

    private final UserRepository userRepository;
    private final PlayerProfileRepository playerProfileRepository;
    private final BookingRepository bookingRepository;
    private final BookingSeriesRepository bookingSeriesRepository;
    private final PasswordEncoder passwordEncoder;

    public FamilyDetailResponse onboardFamily(FamilyOnboardingRequest request, String actorEmail) {
        User parent;

        if (request.getExistingParentUserId() != null) {
            parent = userRepository.findById(request.getExistingParentUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", request.getExistingParentUserId()));
        } else {
            if (userRepository.existsByEmail(request.getParentEmail())) {
                parent = userRepository.findByEmail(request.getParentEmail())
                        .orElseThrow(() -> new ResourceNotFoundException("User not found: " + request.getParentEmail()));
            } else {
                String rawPassword = request.getParentPassword() != null
                        ? request.getParentPassword()
                        : UUID.randomUUID().toString().substring(0, 12);
                log.info("Creating new parent user {} with generated password", request.getParentEmail());
                parent = User.builder()
                        .name(request.getParentName())
                        .email(request.getParentEmail())
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
                        .age(entry.getAge())
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
        long upcoming = bookingRepository.countByEmailIgnoreCase(parent.getEmail());
        return AdminFamiliesListResponse.builder()
                .id(parent.getId())
                .name(parent.getName())
                .email(parent.getEmail())
                .phone(parent.getPhone())
                .createdAt(parent.getCreatedAt())
                .playerCount(playerCount)
                .upcomingSessionCount(upcoming)
                .build();
    }

    private FamilyDetailResponse buildFamilyDetail(User parent) {
        List<PlayerProfile> profiles = playerProfileRepository.findByParentUserIdOrderByNameAsc(parent.getId());

        List<FamilyDetailResponse.PlayerSummary> playerSummaries = profiles.stream()
                .map(p -> FamilyDetailResponse.PlayerSummary.builder()
                        .id(p.getId())
                        .name(p.getName())
                        .age(p.getAge())
                        .skillLevel(p.getSkillLevel())
                        .preferredPosition(p.getPreferredPosition())
                        .active(p.isActive())
                        .build())
                .collect(Collectors.toList());

        List<Booking> bookings = bookingRepository.findByEmailIgnoreCaseOrderByCreatedAtDesc(parent.getEmail());

        LocalDate today = LocalDate.now();
        int totalBookings = bookings.size();
        int upcomingBookings = (int) bookings.stream()
                .filter(b -> b.getBookingDate() != null && !b.getBookingDate().isBefore(today)
                        && b.getBookingStatus() != BookingStatus.CANCELLED)
                .count();
        int completedBookings = (int) bookings.stream()
                .filter(b -> b.getBookingStatus() == BookingStatus.COMPLETED)
                .count();

        List<FamilyDetailResponse.RecentBookingItem> recentBookings = bookings.stream()
                .limit(10)
                .map(b -> FamilyDetailResponse.RecentBookingItem.builder()
                        .id(b.getId())
                        .date(b.getBookingDate())
                        .time(b.getBookingTime())
                        .programName(b.getProgram() != null ? b.getProgram().getName() : null)
                        .status(b.getBookingStatus().name())
                        .playerName(b.getPlayerName())
                        .build())
                .collect(Collectors.toList());

        // Load active series linked to players in this family
        List<BookingSeries> allSeries = bookingSeriesRepository.findAllByOrderByCreatedAtDesc();
        List<Long> playerIds = profiles.stream().map(PlayerProfile::getId).collect(Collectors.toList());
        List<BookingSeriesResponse> seriesResponses = allSeries.stream()
                .filter(s -> s.isActive() && s.getPlayers().stream()
                        .anyMatch(p -> playerIds.contains(p.getId())))
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

    private BookingSeriesResponse toSeriesResponse(BookingSeries series) {
        List<Booking> sessions = bookingRepository.findBySeriesIdOrderByBookingDateAsc(series.getId());
        LocalDate today = LocalDate.now();
        int completed = (int) sessions.stream()
                .filter(b -> b.getBookingStatus() == BookingStatus.COMPLETED
                        || (b.getBookingDate() != null && b.getBookingDate().isBefore(today)))
                .count();
        int upcoming = (int) sessions.stream()
                .filter(b -> b.getBookingDate() != null && !b.getBookingDate().isBefore(today)
                        && b.getBookingStatus() != BookingStatus.CANCELLED)
                .count();

        List<BookingSeriesResponse.PlayerSummary> playerSummaries = series.getPlayers().stream()
                .map(p -> BookingSeriesResponse.PlayerSummary.builder()
                        .id(p.getId())
                        .name(p.getName())
                        .parentUserEmail(p.getParentUser() != null ? p.getParentUser().getEmail() : null)
                        .build())
                .collect(Collectors.toList());

        return BookingSeriesResponse.builder()
                .id(series.getId())
                .coachUserId(series.getCoachUser() != null ? series.getCoachUser().getId() : null)
                .coachName(series.getCoachUser() != null ? series.getCoachUser().getName() : null)
                .programId(series.getProgram() != null ? series.getProgram().getId() : null)
                .programName(series.getProgram() != null ? series.getProgram().getName() : null)
                .title(series.getTitle())
                .startDate(series.getStartDate())
                .endDate(series.getEndDate())
                .weekdays(series.getWeekdays())
                .bookingTime(series.getBookingTime())
                .durationMinutes(series.getDurationMinutes())
                .notes(series.getNotes())
                .active(series.isActive())
                .createdAt(series.getCreatedAt())
                .players(playerSummaries)
                .totalSessions(sessions.size())
                .completedSessions(completed)
                .upcomingSessions(upcoming)
                .build();
    }
}
