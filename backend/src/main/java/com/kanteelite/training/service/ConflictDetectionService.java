package com.kanteelite.training.service;

import com.kanteelite.training.dto.response.ConflictReportResponse;
import com.kanteelite.training.entity.BlockedTime;
import com.kanteelite.training.entity.Session;
import com.kanteelite.training.repository.BlockedTimeRepository;
import com.kanteelite.training.repository.SessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ConflictDetectionService {

    private final SessionRepository sessionRepository;
    private final BlockedTimeRepository blockedTimeRepository;
    private final AvailabilityValidationService availabilityValidationService;

    @Transactional(readOnly = true)
    public ConflictReportResponse checkConflicts(Long coachId, LocalDateTime startDatetime, LocalDateTime endDatetime) {
        List<String> reasons = new ArrayList<>();
        if (coachId == null) {
            reasons.add("Coach is required.");
            return ConflictReportResponse.builder().hasConflict(true).reasons(reasons).build();
        }
        if (startDatetime == null || endDatetime == null || !endDatetime.isAfter(startDatetime)) {
            reasons.add("Invalid start/end time range.");
            return ConflictReportResponse.builder().hasConflict(true).reasons(reasons).build();
        }

        if (!availabilityValidationService.isWithinAvailability(coachId, startDatetime, endDatetime)) {
            reasons.add("Session is outside coach availability.");
        }

        List<Session> overlaps = sessionRepository.findOverlappingSessions(coachId, startDatetime, endDatetime);
        if (!overlaps.isEmpty()) {
            reasons.add("Overlaps with existing sessions.");
        }

        List<BlockedTime> blockedTimes = blockedTimeRepository.findOverlappingBlockedTimes(
                coachId, startDatetime, endDatetime);
        if (!blockedTimes.isEmpty()) {
            reasons.add("Overlaps blocked time.");
        }

        return ConflictReportResponse.builder()
                .hasConflict(!reasons.isEmpty())
                .reasons(reasons)
                .build();
    }
}
