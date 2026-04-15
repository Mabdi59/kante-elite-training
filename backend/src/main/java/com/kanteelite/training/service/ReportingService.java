package com.kanteelite.training.service;

import com.kanteelite.training.enums.AttendanceStatus;
import com.kanteelite.training.enums.PaymentStatus;
import com.kanteelite.training.repository.AttendanceRecordRepository;
import com.kanteelite.training.repository.BookingRepository;
import com.kanteelite.training.repository.ProgramEnrollmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportingService {

    private final BookingRepository bookingRepository;
    private final AttendanceRecordRepository attendanceRepository;
    private final ProgramEnrollmentRepository enrollmentRepository;

    @Transactional(readOnly = true)
    public Map<String, Object> getRevenueSummary() {
        Map<String, Object> summary = new HashMap<>();

        long totalBookings = bookingRepository.count();
        long paidBookings = bookingRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(b -> b.getPaymentStatus() == PaymentStatus.PAID).count();
        long pendingBookings = bookingRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(b -> b.getPaymentStatus() == PaymentStatus.PENDING).count();

        summary.put("totalBookings", totalBookings);
        summary.put("paidBookings", paidBookings);
        summary.put("pendingBookings", pendingBookings);

        Map<String, Long> bookingsByProgram = bookingRepository.findAllByOrderByCreatedAtDesc().stream()
                .collect(Collectors.groupingBy(b -> b.getProgram().getName(), Collectors.counting()));
        summary.put("bookingsByProgram", bookingsByProgram);

        LocalDate sixMonthsAgo = LocalDate.now().minusMonths(6);
        Map<String, Long> bookingsByMonth = bookingRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(b -> b.getBookingDate().isAfter(sixMonthsAgo))
                .collect(Collectors.groupingBy(
                        b -> b.getBookingDate().getYear() + "-" + String.format("%02d", b.getBookingDate().getMonthValue()),
                        LinkedHashMap::new,
                        Collectors.counting()
                ));
        summary.put("bookingsByMonth", bookingsByMonth);

        return summary;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getAttendanceReport(LocalDate from, LocalDate to) {
        Map<String, Object> report = new HashMap<>();
        var records = attendanceRepository.findByDateRangeAndOptionalPlayer(from, to, null);

        long present = records.stream().filter(r -> r.getStatus() == AttendanceStatus.PRESENT).count();
        long absent = records.stream().filter(r -> r.getStatus() == AttendanceStatus.ABSENT).count();
        long late = records.stream().filter(r -> r.getStatus() == AttendanceStatus.LATE).count();

        report.put("totalSessions", records.size());
        report.put("present", present);
        report.put("absent", absent);
        report.put("late", late);
        report.put("attendanceRate", records.isEmpty() ? 0 :
                Math.round((double)(present + late) / records.size() * 100));

        Map<String, Map<String, Long>> byPlayer = records.stream()
                .collect(Collectors.groupingBy(r -> r.getPlayerName() + " (" + r.getPlayerEmail() + ")",
                        Collectors.groupingBy(r -> r.getStatus().name(), Collectors.counting())));
        report.put("byPlayer", byPlayer);

        return report;
    }

    /**
     * Returns daily booking counts for the last {@code days} days (inclusive).
     * Each entry has {@code date} (ISO string) and {@code count}.
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getBookingsOverTime(int days) {
        LocalDate today = LocalDate.now();
        LocalDate from = today.minusDays(days - 1L);

        // Group bookings by date within range
        Map<LocalDate, Long> countsByDate = bookingRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(b -> !b.getBookingDate().isBefore(from) && !b.getBookingDate().isAfter(today))
                .collect(Collectors.groupingBy(b -> b.getBookingDate(), LinkedHashMap::new, Collectors.counting()));

        List<Map<String, Object>> result = new ArrayList<>();
        DateTimeFormatter fmt = DateTimeFormatter.ISO_DATE;
        for (LocalDate date = from; !date.isAfter(today); date = date.plusDays(1)) {
            Map<String, Object> point = new LinkedHashMap<>();
            point.put("date", date.format(fmt));
            point.put("count", countsByDate.getOrDefault(date, 0L));
            result.add(point);
        }
        return result;
    }
}
