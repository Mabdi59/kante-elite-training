package com.kanteelite.training.service;

import com.kanteelite.training.dto.request.BookingSeriesRequest;
import com.kanteelite.training.dto.response.BookingSeriesPreviewItem;
import com.kanteelite.training.dto.response.BookingSeriesResponse;
import com.kanteelite.training.entity.Booking;
import com.kanteelite.training.entity.BookingSeries;
import com.kanteelite.training.entity.PlayerProfile;
import com.kanteelite.training.entity.Program;
import com.kanteelite.training.entity.User;
import com.kanteelite.training.enums.BookingStatus;
import com.kanteelite.training.enums.PaymentStatus;
import com.kanteelite.training.exception.ResourceNotFoundException;
import com.kanteelite.training.repository.BlockedSlotRepository;
import com.kanteelite.training.repository.BookingRepository;
import com.kanteelite.training.repository.BookingSeriesRepository;
import com.kanteelite.training.repository.PlayerProfileRepository;
import com.kanteelite.training.repository.ProgramRepository;
import com.kanteelite.training.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class RecurringScheduleService {

    private final BookingSeriesRepository bookingSeriesRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final PlayerProfileRepository playerProfileRepository;
    private final ProgramRepository programRepository;
    private final BlockedSlotRepository blockedSlotRepository;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    private static final int DEFAULT_SERIES_WEEKS = 12;

    @Transactional(readOnly = true)
    public List<BookingSeriesPreviewItem> previewSeries(BookingSeriesRequest request) {
        LocalDate endDate = resolveEndDate(request);
        List<DayOfWeek> weekdays = parseWeekdays(request.getWeekdays());

        User coach = request.getCoachUserId() != null
                ? userRepository.findById(request.getCoachUserId()).orElse(null)
                : null;
        Program program = request.getProgramId() != null
                ? programRepository.findById(request.getProgramId()).orElse(null)
                : null;

        List<BookingSeriesPreviewItem> items = new ArrayList<>();
        LocalDate cursor = request.getStartDate();

        while (!cursor.isAfter(endDate)) {
            DayOfWeek cursorDay = cursor.getDayOfWeek();
            if (weekdays.contains(cursorDay)) {
                boolean conflict = false;
                String conflictReason = null;

                // Check coach conflict
                if (coach != null) {
                    boolean coachConflict = bookingRepository
                            .existsByCoachUserIdAndBookingDateAndBookingTimeAndBookingStatusNot(
                                    coach.getId(), cursor, request.getBookingTime(), BookingStatus.CANCELLED);
                    if (coachConflict) {
                        conflict = true;
                        conflictReason = "Coach already has a booking at this time";
                    }
                }

                // Check blocked slots
                if (!conflict && !blockedSlotRepository.findBlockingSlots(cursor, request.getBookingTime()).isEmpty()) {
                    conflict = true;
                    conflictReason = "Date/time is blocked";
                }

                items.add(BookingSeriesPreviewItem.builder()
                        .date(cursor)
                        .dayOfWeek(cursorDay.name())
                        .bookingTime(request.getBookingTime())
                        .coachName(coach != null ? coach.getName() : null)
                        .programName(program != null ? program.getName() : null)
                        .conflict(conflict)
                        .conflictReason(conflictReason)
                        .build());
            }
            cursor = cursor.plusDays(1);
        }
        return items;
    }

    public BookingSeriesResponse createSeries(BookingSeriesRequest request, String actorEmail) {
        if (request.getStartDate() == null) {
            throw new IllegalArgumentException("startDate is required");
        }
        if (request.getWeekdays() == null || request.getWeekdays().isBlank()) {
            throw new IllegalArgumentException("At least one weekday is required");
        }
        if (request.getBookingTime() == null || request.getBookingTime().isBlank()) {
            throw new IllegalArgumentException("bookingTime is required");
        }

        User coach = null;
        if (request.getCoachUserId() != null) {
            coach = userRepository.findById(request.getCoachUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("Coach user", request.getCoachUserId()));
        }

        Program program = null;
        if (request.getProgramId() != null) {
            program = programRepository.findById(request.getProgramId())
                    .orElseThrow(() -> new ResourceNotFoundException("Program", request.getProgramId()));
        }
        if (program == null) {
            throw new IllegalArgumentException("programId is required to create bookings");
        }

        List<PlayerProfile> players = new ArrayList<>();
        if (request.getPlayerProfileIds() != null) {
            for (Long pid : request.getPlayerProfileIds()) {
                players.add(playerProfileRepository.findById(pid)
                        .orElseThrow(() -> new ResourceNotFoundException("PlayerProfile", pid)));
            }
        }

        LocalDate endDate = resolveEndDate(request);

        BookingSeries series = BookingSeries.builder()
                .coachUser(coach)
                .program(program)
                .title(request.getTitle())
                .startDate(request.getStartDate())
                .endDate(endDate)
                .weekdays(request.getWeekdays())
                .bookingTime(request.getBookingTime())
                .durationMinutes(request.getDurationMinutes() != null ? request.getDurationMinutes() : 60)
                .notes(request.getNotes())
                .active(true)
                .players(players)
                .build();

        series = bookingSeriesRepository.save(series);

        // Create individual bookings for each non-conflicted session.
        // When multiple players are in the series, create one booking per player per session
        // so each player has a dedicated booking record. For a single player, it is straightforward.
        List<BookingSeriesPreviewItem> preview = previewSeries(request);
        int created = 0;
        for (BookingSeriesPreviewItem item : preview) {
            if (item.isConflict()) {
                log.info("Skipping conflicted session on {} at {}: {}", item.getDate(), item.getBookingTime(), item.getConflictReason());
                continue;
            }

            if (players.isEmpty()) {
                // Create a placeholder booking when no players are linked yet
                Booking booking = Booking.builder()
                        .program(program)
                        .bookingDate(item.getDate())
                        .bookingTime(item.getBookingTime())
                        .playerName("TBD")
                        .email(actorEmail != null ? actorEmail : "")
                        .phone("")
                        .paymentStatus(PaymentStatus.PENDING)
                        .bookingStatus(BookingStatus.CONFIRMED)
                        .series(series)
                        .coachUser(coach)
                        .build();
                bookingRepository.save(booking);
                created++;
            } else {
                for (PlayerProfile player : players) {
                    User parentUser = player.getParentUser();
                    String parentEmail = parentUser != null ? parentUser.getEmail() : "";
                    String parentName = parentUser != null ? parentUser.getName() : null;
                    String parentPhone = parentUser != null && parentUser.getPhone() != null
                            ? parentUser.getPhone() : "";
                    String playerAge = player.getAge() != null ? player.getAge().toString() : null;

                    Booking booking = Booking.builder()
                            .program(program)
                            .bookingDate(item.getDate())
                            .bookingTime(item.getBookingTime())
                            .playerName(player.getName())
                            .playerAge(playerAge)
                            .parentName(parentName)
                            .email(parentEmail)
                            .phone(parentPhone)
                            .notes(series.getNotes())
                            .paymentStatus(PaymentStatus.PENDING)
                            .bookingStatus(BookingStatus.CONFIRMED)
                            .series(series)
                            .playerProfile(player)
                            .coachUser(coach)
                            .build();
                    bookingRepository.save(booking);
                    created++;
                }
            }
        }

        auditLogService.log(actorEmail, "CREATE", "BookingSeries", series.getId(),
                "Created series with " + created + " sessions");

        Long savedId = series.getId();
        return toSeriesResponse(bookingSeriesRepository.findById(savedId)
                .orElseThrow(() -> new ResourceNotFoundException("BookingSeries", savedId)));
    }

    @Transactional(readOnly = true)
    public BookingSeriesResponse getSeries(Long id) {
        BookingSeries series = bookingSeriesRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("BookingSeries", id));
        return toSeriesResponse(series);
    }

    @Transactional(readOnly = true)
    public List<BookingSeriesResponse> getAllSeries() {
        return bookingSeriesRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toSeriesResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BookingSeriesResponse> getSeriesByCoach(Long coachUserId) {
        return bookingSeriesRepository.findByCoachUserIdOrderByStartDateAsc(coachUserId).stream()
                .map(this::toSeriesResponse)
                .collect(Collectors.toList());
    }

    public void cancelSession(Long bookingId, String actorEmail) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", bookingId));
        booking.setBookingStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);
        auditLogService.log(actorEmail, "CANCEL_SESSION", "Booking", bookingId, "Cancelled series session");
    }

    public void cancelFutureSessions(Long seriesId, LocalDate fromDate, String actorEmail) {
        List<Booking> sessions = bookingRepository.findBySeriesIdOrderByBookingDateAsc(seriesId);
        int count = 0;
        for (Booking b : sessions) {
            if (b.getBookingDate() != null && !b.getBookingDate().isBefore(fromDate)
                    && b.getBookingStatus() != BookingStatus.CANCELLED) {
                b.setBookingStatus(BookingStatus.CANCELLED);
                bookingRepository.save(b);
                count++;
            }
        }
        auditLogService.log(actorEmail, "CANCEL_FUTURE_SESSIONS", "BookingSeries", seriesId,
                "Cancelled " + count + " sessions from " + fromDate);
    }

    public void deleteSeries(Long seriesId, String actorEmail) {
        BookingSeries series = bookingSeriesRepository.findById(seriesId)
                .orElseThrow(() -> new ResourceNotFoundException("BookingSeries", seriesId));
        cancelFutureSessions(seriesId, LocalDate.now(), actorEmail);
        series.setActive(false);
        bookingSeriesRepository.save(series);
        auditLogService.log(actorEmail, "DELETE_SERIES", "BookingSeries", seriesId, "Series marked inactive");
    }

    private LocalDate resolveEndDate(BookingSeriesRequest request) {
        if (request.getEndDate() != null) {
            return request.getEndDate();
        }
        if (request.getNumberOfWeeks() != null && request.getNumberOfWeeks() > 0) {
            return request.getStartDate().plusWeeks(request.getNumberOfWeeks()).minusDays(1);
        }
        return request.getStartDate().plusWeeks(DEFAULT_SERIES_WEEKS).minusDays(1);
    }

    private List<DayOfWeek> parseWeekdays(String weekdays) {
        if (weekdays == null || weekdays.isBlank()) {
            return List.of();
        }
        return Arrays.stream(weekdays.split(","))
                .map(String::trim)
                .map(String::toUpperCase)
                .map(DayOfWeek::valueOf)
                .collect(Collectors.toList());
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
