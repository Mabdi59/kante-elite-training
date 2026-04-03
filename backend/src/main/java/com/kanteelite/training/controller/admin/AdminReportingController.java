package com.kanteelite.training.controller.admin;

import com.kanteelite.training.service.ReportingService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
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
}
