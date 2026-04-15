package com.kanteelite.training.controller.admin;

import com.kanteelite.training.service.ReportingService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/reports")
@RequiredArgsConstructor
public class AdminReportingController {

    private final ReportingService reportingService;

    @GetMapping("/revenue")
    public ResponseEntity<Map<String, Object>> revenueReport() {
        return ResponseEntity.ok(reportingService.getRevenueSummary());
    }

    @GetMapping("/attendance")
    public ResponseEntity<Map<String, Object>> attendanceReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        LocalDate start = from != null ? from : LocalDate.now().minusMonths(3);
        LocalDate end = to != null ? to : LocalDate.now();
        return ResponseEntity.ok(reportingService.getAttendanceReport(start, end));
    }

    @GetMapping("/revenue/csv")
    public ResponseEntity<byte[]> revenueReportCsv() {
        Map<String, Object> data = reportingService.getRevenueSummary();
        StringBuilder csv = new StringBuilder();

        csv.append("Revenue Summary\r\n");
        csv.append("Total Bookings,Paid Bookings,Pending Bookings\r\n");
        csv.append(data.getOrDefault("totalBookings", 0)).append(',')
           .append(data.getOrDefault("paidBookings", 0)).append(',')
           .append(data.getOrDefault("pendingBookings", 0)).append("\r\n");

        csv.append("\r\nBookings by Program\r\n");
        csv.append("Program,Bookings\r\n");
        @SuppressWarnings("unchecked")
        Map<String, ?> byProgram = (Map<String, ?>) data.getOrDefault("bookingsByProgram", Map.of());
        for (Map.Entry<String, ?> entry : byProgram.entrySet()) {
            csv.append(escapeCsvField(entry.getKey())).append(',').append(entry.getValue()).append("\r\n");
        }

        csv.append("\r\nBookings by Month\r\n");
        csv.append("Month,Bookings\r\n");
        @SuppressWarnings("unchecked")
        Map<String, ?> byMonth = (Map<String, ?>) data.getOrDefault("bookingsByMonth", Map.of());
        for (Map.Entry<String, ?> entry : byMonth.entrySet()) {
            csv.append(escapeCsvField(entry.getKey())).append(',').append(entry.getValue()).append("\r\n");
        }

        byte[] bytes = csv.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"revenue-report.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(bytes);
    }

    @GetMapping("/attendance/csv")
    public ResponseEntity<byte[]> attendanceReportCsv(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        LocalDate start = from != null ? from : LocalDate.now().minusMonths(3);
        LocalDate end = to != null ? to : LocalDate.now();
        Map<String, Object> data = reportingService.getAttendanceReport(start, end);

        StringBuilder csv = new StringBuilder();
        csv.append("Attendance Report\r\n");
        csv.append("Period,").append(start).append(" to ").append(end).append("\r\n");
        csv.append("Total,Present,Absent,Late\r\n");
        csv.append(data.getOrDefault("totalSessions", 0)).append(',')
           .append(data.getOrDefault("present", 0)).append(',')
           .append(data.getOrDefault("absent", 0)).append(',')
           .append(data.getOrDefault("late", 0)).append("\r\n");

        csv.append("\r\nBy Player\r\n");
        csv.append("Player,PRESENT,ABSENT,LATE\r\n");
        @SuppressWarnings("unchecked")
        Map<String, Map<String, Long>> byPlayer =
                (Map<String, Map<String, Long>>) data.getOrDefault("byPlayer", Map.of());
        for (Map.Entry<String, Map<String, Long>> entry : byPlayer.entrySet()) {
            Map<String, Long> counts = entry.getValue();
            csv.append(escapeCsvField(entry.getKey())).append(',')
               .append(counts.getOrDefault("PRESENT", 0L)).append(',')
               .append(counts.getOrDefault("ABSENT", 0L)).append(',')
               .append(counts.getOrDefault("LATE", 0L)).append("\r\n");
        }

        byte[] bytes = csv.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"attendance-report.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(bytes);
    }

    private String escapeCsvField(String value) {
        if (value == null) return "";
        // Trim before checking for formula injection (handles leading whitespace obfuscation)
        String trimmed = value.trim();
        if (!trimmed.isEmpty() && (trimmed.charAt(0) == '=' || trimmed.charAt(0) == '+' ||
                trimmed.charAt(0) == '-' || trimmed.charAt(0) == '@')) {
            value = "'" + value;
        }
        // Quote fields containing special characters
        if (value.contains(",") || value.contains("\"") || value.contains("\n") || value.contains("\r")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
