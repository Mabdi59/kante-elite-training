package com.kanteelite.training.controller.admin;

import com.kanteelite.training.dto.request.AvailabilityRuleRequest;
import com.kanteelite.training.dto.request.BlockedTimeRequest;
import com.kanteelite.training.dto.request.BlockedSlotRequest;
import com.kanteelite.training.dto.response.ApiResponse;
import com.kanteelite.training.dto.response.AvailabilityRuleResponse;
import com.kanteelite.training.dto.response.BlockedTimeResponse;
import com.kanteelite.training.dto.response.BlockedSlotResponse;
import com.kanteelite.training.dto.response.ConflictReportResponse;
import com.kanteelite.training.service.AvailabilityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin/availability")
@RequiredArgsConstructor
public class AdminAvailabilityController {

    private final AvailabilityService availabilityService;

    // ─── Availability Rules ───────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<ApiResponse<List<AvailabilityRuleResponse>>> getAvailability(
            @RequestParam(required = false) Long coachId) {
        return ResponseEntity.ok(ApiResponse.success(availabilityService.getCoachRules(coachId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AvailabilityRuleResponse>> createAvailability(
            @Valid @RequestBody AvailabilityRuleRequest request) {
        AvailabilityRuleResponse created = availabilityService.createRule(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Availability rule created.", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AvailabilityRuleResponse>> updateAvailability(
            @PathVariable Long id, @Valid @RequestBody AvailabilityRuleRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Availability rule updated.", availabilityService.updateRule(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAvailability(@PathVariable Long id) {
        availabilityService.deleteRule(id);
        return ResponseEntity.ok(ApiResponse.success("Availability rule deleted.", null));
    }

    @GetMapping("/conflicts")
    public ResponseEntity<ApiResponse<ConflictReportResponse>> getConflicts(
            @RequestParam Long coachId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(ApiResponse.success(availabilityService.getConflicts(coachId, start, end)));
    }

    @GetMapping("/rules")
    public ResponseEntity<ApiResponse<List<AvailabilityRuleResponse>>> getRules() {
        return ResponseEntity.ok(ApiResponse.success(availabilityService.getAllRulesIncludingInactive()));
    }

    @PostMapping("/rules")
    public ResponseEntity<ApiResponse<AvailabilityRuleResponse>> createRule(
            @Valid @RequestBody AvailabilityRuleRequest request) {
        AvailabilityRuleResponse created = availabilityService.createRule(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Rule created.", created));
    }

    @PutMapping("/rules/{id}")
    public ResponseEntity<ApiResponse<AvailabilityRuleResponse>> updateRule(
            @PathVariable Long id, @Valid @RequestBody AvailabilityRuleRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Rule updated.", availabilityService.updateRule(id, request)));
    }

    @DeleteMapping("/rules/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRule(@PathVariable Long id) {
        availabilityService.deleteRule(id);
        return ResponseEntity.ok(ApiResponse.success("Rule deleted.", null));
    }

    // ─── Blocked Slots ────────────────────────────────────────────────────────

    @GetMapping("/blocked-times")
    public ResponseEntity<ApiResponse<List<BlockedTimeResponse>>> getBlockedTimes(
            @RequestParam(required = false) Long coachId) {
        return ResponseEntity.ok(ApiResponse.success(availabilityService.getBlockedTimes(coachId)));
    }

    @PostMapping("/blocked-times")
    public ResponseEntity<ApiResponse<BlockedTimeResponse>> createBlockedTime(
            @Valid @RequestBody BlockedTimeRequest request) {
        BlockedTimeResponse created = availabilityService.createBlockedTime(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Blocked time created.", created));
    }

    @PutMapping("/blocked-times/{id}")
    public ResponseEntity<ApiResponse<BlockedTimeResponse>> updateBlockedTime(
            @PathVariable Long id,
            @Valid @RequestBody BlockedTimeRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Blocked time updated.", availabilityService.updateBlockedTime(id, request)));
    }

    @DeleteMapping("/blocked-times/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBlockedTime(@PathVariable Long id) {
        availabilityService.deleteBlockedTime(id);
        return ResponseEntity.ok(ApiResponse.success("Blocked time removed.", null));
    }

    @GetMapping("/blocked")
    public ResponseEntity<ApiResponse<List<BlockedSlotResponse>>> getBlockedSlots() {
        return ResponseEntity.ok(ApiResponse.success(availabilityService.getAllBlockedSlots()));
    }

    @PostMapping("/blocked")
    public ResponseEntity<ApiResponse<BlockedSlotResponse>> createBlockedSlot(
            @Valid @RequestBody BlockedSlotRequest request) {
        BlockedSlotResponse created = availabilityService.createBlockedSlot(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Slot blocked.", created));
    }

    @PutMapping("/blocked/{id}")
    public ResponseEntity<ApiResponse<BlockedSlotResponse>> updateBlockedSlot(
            @PathVariable Long id,
            @Valid @RequestBody BlockedSlotRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Blocked slot updated.",
                availabilityService.updateBlockedSlot(id, request)));
    }

    @DeleteMapping("/blocked/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBlockedSlot(@PathVariable Long id) {
        availabilityService.deleteBlockedSlot(id);
        return ResponseEntity.ok(ApiResponse.success("Blocked slot removed.", null));
    }
}
