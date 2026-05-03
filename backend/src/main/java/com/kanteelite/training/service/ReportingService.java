package com.kanteelite.training.service;

import com.kanteelite.training.repository.RegistrationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReportingService {

    private final RegistrationRepository registrationRepository;

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getRegistrationsOverTime(int days) {
        LocalDate today = LocalDate.now();
        LocalDate from = today.minusDays(days - 1L);

        Map<LocalDate, Long> countsByDate = new LinkedHashMap<>();
        registrationRepository.findByCreatedAtBetween(from.atStartOfDay(), today.plusDays(1).atStartOfDay())
                .forEach(registration -> {
                    LocalDate date = registration.getCreatedAt() != null
                            ? registration.getCreatedAt().toLocalDate()
                            : today;
                    countsByDate.merge(date, 1L, Long::sum);
                });

        List<Map<String, Object>> result = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ISO_DATE;
        for (LocalDate date = from; !date.isAfter(today); date = date.plusDays(1)) {
            Map<String, Object> point = new LinkedHashMap<>();
            point.put("date", date.format(formatter));
            point.put("count", countsByDate.getOrDefault(date, 0L));
            result.add(point);
        }
        return result;
    }
}
