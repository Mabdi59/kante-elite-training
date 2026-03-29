package com.kanteelite.training.controller.admin;

import com.kanteelite.training.dto.request.AvailabilityRuleRequest;
import com.kanteelite.training.dto.request.BlockedSlotRequest;
import com.kanteelite.training.dto.response.ApiResponse;
import com.kanteelite.training.dto.response.AvailabilityRuleResponse;
import com.kanteelite.training.dto.response.BlockedSlotResponse;
import com.kanteelite.training.service.AvailabilityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/availability")
@RequiredArgsConstructor
public class AdminAvailabilityController {

    private final AvailabilityService availabilityService;

    // ─── Availability Rules ───────────────────────────────────────────────────

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

    @DeleteMapping("/blocked/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBlockedSlot(@PathVariable Long id) {
        availabilityService.deleteBlockedSlot(id);
        return ResponseEntity.ok(ApiResponse.success("Blocked slot removed.", null));
    }
}
