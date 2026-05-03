package com.kanteelite.training.controller.admin;

import com.kanteelite.training.service.ReportingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/reports")
@RequiredArgsConstructor
public class AdminReportingController {

    private final ReportingService reportingService;

    @GetMapping("/registrations-over-time")
    public ResponseEntity<List<Map<String, Object>>> registrationsOverTime(
            @RequestParam(defaultValue = "30") int days) {
        int clampedDays = Math.max(7, Math.min(days, 365));
        return ResponseEntity.ok(reportingService.getRegistrationsOverTime(clampedDays));
    }
}
