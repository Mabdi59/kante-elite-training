package com.kanteelite.training.service;

import com.kanteelite.training.dto.request.AvailabilityRuleRequest;
import com.kanteelite.training.dto.request.BlockedTimeRequest;
import com.kanteelite.training.dto.request.BlockedSlotRequest;
import com.kanteelite.training.dto.response.AvailabilityResponse;
import com.kanteelite.training.dto.response.BlockedTimeResponse;
import com.kanteelite.training.dto.response.ConflictReportResponse;
import com.kanteelite.training.dto.response.AvailabilityRuleResponse;
import com.kanteelite.training.dto.response.BlockedSlotResponse;
import com.kanteelite.training.entity.AvailabilityRule;
import com.kanteelite.training.entity.BlockedTime;
import com.kanteelite.training.entity.BlockedSlot;
import com.kanteelite.training.entity.User;
import com.kanteelite.training.enums.UserRole;
import com.kanteelite.training.exception.ResourceNotFoundException;
import com.kanteelite.training.repository.AvailabilityRuleRepository;
import com.kanteelite.training.repository.BlockedTimeRepository;
import com.kanteelite.training.repository.BlockedSlotRepository;
import com.kanteelite.training.repository.BookingRepository;
import com.kanteelite.training.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AvailabilityService {

    private final BookingRepository bookingRepository;
    private final AvailabilityRuleRepository availabilityRuleRepository;
    private final BlockedSlotRepository blockedSlotRepository;
    private final BlockedTimeRepository blockedTimeRepository;
    private final UserRepository userRepository;
    private final ConflictDetectionService conflictDetectionService;

    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("h:mm a");
    private static final LocalTime DEFAULT_START = LocalTime.of(8, 0);
    private static final LocalTime DEFAULT_END   = LocalTime.of(18, 0);
    private static final int SLOT_MINUTES = 60;

    public AvailabilityResponse getAvailability(Long programId, LocalDate date) {
        List<String> booked = bookingRepository.findBookedTimesByProgramAndDate(programId, date);

        // Get all blocked times for this date (null slot_time = whole day blocked)
        List<BlockedSlot> blocked = blockedSlotRepository.findBySlotDateOrderBySlotTimeAsc(date);
        boolean dayBlocked = blocked.stream().anyMatch(bs -> bs.getSlotTime() == null);
        Set<String> blockedTimes = blocked.stream()
                .filter(bs -> bs.getSlotTime() != null)
                .map(BlockedSlot::getSlotTime)
                .collect(Collectors.toSet());

        List<String> allSlots = generateTimeSlotsForDate(date);

        List<String> available;
        if (dayBlocked) {
            available = List.of();
        } else {
            available = allSlots.stream()
                    .filter(slot -> !booked.contains(slot) && !blockedTimes.contains(slot))
                    .toList();
        }

        return AvailabilityResponse.builder()
                .programId(programId)
                .date(date.toString())
                .bookedSlots(booked)
                .availableSlots(available)
                .build();
    }

    public boolean isSlotBlocked(LocalDate date, String time) {
        return !blockedSlotRepository.findBlockingSlots(date, time).isEmpty();
    }

    private List<String> generateTimeSlotsForDate(LocalDate date) {
        // Day of week: Java DayOfWeek is 1=Monday...7=Sunday; we use 0=Sunday,1=Monday pattern
        int dayOfWeek = date.getDayOfWeek() == DayOfWeek.SUNDAY ? 0 : date.getDayOfWeek().getValue();
        List<AvailabilityRule> rules = availabilityRuleRepository.findByActiveTrueAndDayOfWeek(dayOfWeek);

        if (rules.isEmpty()) {
            return generateSlots(DEFAULT_START, DEFAULT_END);
        }

        List<String> slots = new ArrayList<>();
        for (AvailabilityRule rule : rules) {
            slots.addAll(generateSlots(rule.getStartTime(), rule.getEndTime()));
        }
        return slots.stream().distinct().sorted().toList();
    }

    private List<String> generateSlots(LocalTime start, LocalTime end) {
        List<String> slots = new ArrayList<>();
        LocalTime current = start;
        while (current.isBefore(end)) {
            slots.add(current.format(TIME_FMT));
            current = current.plusMinutes(SLOT_MINUTES);
        }
        return slots;
    }

    // ─── Admin: Availability Rules CRUD ─────────────────────────────────────

    @Transactional(readOnly = true)
    public List<AvailabilityRuleResponse> getAllRules() {
        return availabilityRuleRepository.findByActiveTrueOrderByDayOfWeekAscStartTimeAsc()
                .stream().map(this::toRuleResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<AvailabilityRuleResponse> getAllRulesIncludingInactive() {
        return availabilityRuleRepository.findAll()
                .stream().map(this::toRuleResponse).toList();
    }

    @Transactional
    public AvailabilityRuleResponse createRule(AvailabilityRuleRequest req) {
        AvailabilityRule rule = AvailabilityRule.builder()
                .dayOfWeek(req.getDayOfWeek())
                .startTime(req.getStartTime())
                .endTime(req.getEndTime())
                .active(req.isActive())
                .coachUser(resolveCoach(req.getCoachId()))
                .timezone(req.getTimezone() != null ? req.getTimezone() : "America/New_York")
                .build();
        return toRuleResponse(availabilityRuleRepository.save(rule));
    }

    @Transactional
    public AvailabilityRuleResponse updateRule(Long id, AvailabilityRuleRequest req) {
        AvailabilityRule rule = availabilityRuleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AvailabilityRule", id));
        rule.setDayOfWeek(req.getDayOfWeek());
        rule.setStartTime(req.getStartTime());
        rule.setEndTime(req.getEndTime());
        rule.setActive(req.isActive());
        rule.setCoachUser(resolveCoach(req.getCoachId()));
        rule.setTimezone(req.getTimezone() != null ? req.getTimezone() : rule.getTimezone());
        return toRuleResponse(availabilityRuleRepository.save(rule));
    }

    @Transactional
    public void deleteRule(Long id) {
        if (!availabilityRuleRepository.existsById(id)) {
            throw new ResourceNotFoundException("AvailabilityRule", id);
        }
        availabilityRuleRepository.deleteById(id);
    }

    // ─── Admin: Blocked Slots CRUD ───────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<BlockedSlotResponse> getAllBlockedSlots() {
        return blockedSlotRepository.findAllByOrderBySlotDateDescCreatedAtDesc()
                .stream().map(this::toBlockedSlotResponse).toList();
    }

    @Transactional
    public BlockedSlotResponse createBlockedSlot(BlockedSlotRequest req) {
        BlockedSlot slot = BlockedSlot.builder()
                .slotDate(req.getSlotDate())
                .slotTime(req.getSlotTime())
                .reason(req.getReason())
                .build();
        return toBlockedSlotResponse(blockedSlotRepository.save(slot));
    }

    @Transactional
    public BlockedSlotResponse updateBlockedSlot(Long id, BlockedSlotRequest req) {
        BlockedSlot slot = blockedSlotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("BlockedSlot", id));
        slot.setSlotDate(req.getSlotDate());
        slot.setSlotTime(req.getSlotTime());
        slot.setReason(req.getReason());
        return toBlockedSlotResponse(blockedSlotRepository.save(slot));
    }

    @Transactional
    public void deleteBlockedSlot(Long id) {
        if (!blockedSlotRepository.existsById(id)) {
            throw new ResourceNotFoundException("BlockedSlot", id);
        }
        blockedSlotRepository.deleteById(id);
    }

    // ─── New schedule boundary APIs ────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<AvailabilityRuleResponse> getCoachRules(Long coachId) {
        if (coachId == null) {
            return getAllRulesIncludingInactive();
        }
        return availabilityRuleRepository.findByCoachUserIdOrderByDayOfWeekAscStartTimeAsc(coachId)
                .stream()
                .map(this::toRuleResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BlockedTimeResponse> getBlockedTimes(Long coachId) {
        if (coachId == null) {
            return blockedTimeRepository.findAll().stream()
                    .map(this::toBlockedTimeResponse)
                    .toList();
        }
        return blockedTimeRepository.findByCoachUserIdOrderByStartDatetimeDesc(coachId).stream()
                .map(this::toBlockedTimeResponse)
                .toList();
    }

    @Transactional
    public BlockedTimeResponse createBlockedTime(BlockedTimeRequest request) {
        if (!request.getEndDatetime().isAfter(request.getStartDatetime())) {
            throw new IllegalArgumentException("endDatetime must be after startDatetime");
        }
        BlockedTime blockedTime = BlockedTime.builder()
                .coachUser(resolveCoach(request.getCoachId()))
                .startDatetime(request.getStartDatetime())
                .endDatetime(request.getEndDatetime())
                .reason(request.getReason())
                .build();
        return toBlockedTimeResponse(blockedTimeRepository.save(blockedTime));
    }

    @Transactional
    public BlockedTimeResponse updateBlockedTime(Long id, BlockedTimeRequest request) {
        BlockedTime blockedTime = blockedTimeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("BlockedTime", id));
        if (!request.getEndDatetime().isAfter(request.getStartDatetime())) {
            throw new IllegalArgumentException("endDatetime must be after startDatetime");
        }
        blockedTime.setCoachUser(resolveCoach(request.getCoachId()));
        blockedTime.setStartDatetime(request.getStartDatetime());
        blockedTime.setEndDatetime(request.getEndDatetime());
        blockedTime.setReason(request.getReason());
        return toBlockedTimeResponse(blockedTimeRepository.save(blockedTime));
    }

    @Transactional
    public void deleteBlockedTime(Long id) {
        if (!blockedTimeRepository.existsById(id)) {
            throw new ResourceNotFoundException("BlockedTime", id);
        }
        blockedTimeRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public ConflictReportResponse getConflicts(Long coachId, LocalDateTime start, LocalDateTime end) {
        return conflictDetectionService.checkConflicts(coachId, start, end);
    }

    private AvailabilityRuleResponse toRuleResponse(AvailabilityRule r) {
        return AvailabilityRuleResponse.builder()
                .id(r.getId())
                .coachId(r.getCoachUser() != null ? r.getCoachUser().getId() : null)
                .coachName(r.getCoachUser() != null ? r.getCoachUser().getName() : null)
                .dayOfWeek(r.getDayOfWeek())
                .startTime(r.getStartTime())
                .endTime(r.getEndTime())
                .active(r.isActive())
                .timezone(r.getTimezone())
                .createdAt(r.getCreatedAt())
                .build();
    }

    private BlockedSlotResponse toBlockedSlotResponse(BlockedSlot b) {
        return BlockedSlotResponse.builder()
                .id(b.getId())
                .slotDate(b.getSlotDate())
                .slotTime(b.getSlotTime())
                .reason(b.getReason())
                .createdAt(b.getCreatedAt())
                .build();
    }

    private BlockedTimeResponse toBlockedTimeResponse(BlockedTime blockedTime) {
        return BlockedTimeResponse.builder()
                .id(blockedTime.getId())
                .coachId(blockedTime.getCoachUser() != null ? blockedTime.getCoachUser().getId() : null)
                .coachName(blockedTime.getCoachUser() != null ? blockedTime.getCoachUser().getName() : null)
                .startDatetime(blockedTime.getStartDatetime())
                .endDatetime(blockedTime.getEndDatetime())
                .reason(blockedTime.getReason())
                .createdAt(blockedTime.getCreatedAt())
                .build();
    }

    private User resolveCoach(Long coachId) {
        if (coachId != null) {
            return userRepository.findById(coachId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", coachId));
        }
        return userRepository.findFirstByRoleOrderByNameAsc(UserRole.COACH)
                .orElseGet(() -> userRepository.findFirstByRoleOrderByNameAsc(UserRole.ADMIN).orElse(null));
    }
}
