package com.kanteelite.training.service;

import com.kanteelite.training.repository.BookingRepository;
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

    private final BookingRepository bookingRepository;

    /**
     * Returns daily booking counts for the last {@code days} days (inclusive).
     * Each entry has {@code date} (ISO string) and {@code count}.
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getBookingsOverTime(int days) {
        LocalDate today = LocalDate.now();
        LocalDate from = today.minusDays(days - 1L);

        Map<LocalDate, Long> countsByDate = new LinkedHashMap<>();
        for (Object[] row : bookingRepository.countBookingsByDateRange(from, today)) {
            if (row.length < 2 || !(row[0] instanceof LocalDate bookingDate) || !(row[1] instanceof Number count)) {
                continue;
            }
            countsByDate.put(bookingDate, count.longValue());
        }

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
