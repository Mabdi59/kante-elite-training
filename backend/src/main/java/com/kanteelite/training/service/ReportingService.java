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
import java.util.HashMap;
import java.util.LinkedHashMap;
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
}
