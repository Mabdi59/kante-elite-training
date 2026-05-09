package com.kanteelite.training.service;

import com.kanteelite.training.entity.AvailabilityRule;
import com.kanteelite.training.repository.AvailabilityRuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AvailabilityValidationService {

    private final AvailabilityRuleRepository availabilityRuleRepository;

    @Transactional(readOnly = true)
    public List<AvailabilityRule> getCoachAvailability(Long coachId, LocalDate date) {
        return availabilityRuleRepository.findByActiveTrueAndCoachUserIdAndDayOfWeekOrderByStartTimeAsc(
                coachId, toDayOfWeekNumber(date.getDayOfWeek()));
    }

    @Transactional(readOnly = true)
    public boolean isWithinAvailability(Long coachId, LocalDateTime startDatetime, LocalDateTime endDatetime) {
        if (coachId == null || startDatetime == null || endDatetime == null || !endDatetime.isAfter(startDatetime)) {
            return false;
        }
        if (!startDatetime.toLocalDate().equals(endDatetime.toLocalDate())) {
            return false;
        }
        List<AvailabilityRule> rules = getCoachAvailability(coachId, startDatetime.toLocalDate());
        if (rules.isEmpty()) {
            return false;
        }
        return rules.stream().anyMatch(rule ->
                !startDatetime.toLocalTime().isBefore(rule.getStartTime())
                        && !endDatetime.toLocalTime().isAfter(rule.getEndTime()));
    }

    private int toDayOfWeekNumber(DayOfWeek dayOfWeek) {
        return dayOfWeek == DayOfWeek.SUNDAY ? 0 : dayOfWeek.getValue();
    }
}
