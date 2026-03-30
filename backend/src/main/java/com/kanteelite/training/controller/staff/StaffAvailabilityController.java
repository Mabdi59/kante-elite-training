package com.kanteelite.training.controller.staff;

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
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/staff/availability")
@RequiredArgsConstructor
public class StaffAvailabilityController {

    private final AvailabilityService availabilityService;

    @GetMapping("/rules")
    public ResponseEntity<ApiResponse<List<AvailabilityRuleResponse>>> getRules() {
        return ResponseEntity.ok(ApiResponse.success(availabilityService.getAllRulesIncludingInactive()));
    }

    @PostMapping("/rules")
    public ResponseEntity<ApiResponse<AvailabilityRuleResponse>> createRule(
            @Valid @RequestBody AvailabilityRuleRequest request) {
        AvailabilityRuleResponse created = availabilityService.createRule(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Rule created.", created));
    }

    @PutMapping("/rules/{id}")
    public ResponseEntity<ApiResponse<AvailabilityRuleResponse>> updateRule(
            @PathVariable Long id,
            @Valid @RequestBody AvailabilityRuleRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Rule updated.",
                availabilityService.updateRule(id, request)));
    }

    @DeleteMapping("/rules/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRule(@PathVariable Long id) {
        availabilityService.deleteRule(id);
        return ResponseEntity.ok(ApiResponse.success("Rule deleted.", null));
    }

    @GetMapping("/blocked")
    public ResponseEntity<ApiResponse<List<BlockedSlotResponse>>> getBlockedSlots() {
        return ResponseEntity.ok(ApiResponse.success(availabilityService.getAllBlockedSlots()));
    }

    @PostMapping("/blocked")
    public ResponseEntity<ApiResponse<BlockedSlotResponse>> createBlockedSlot(
            @Valid @RequestBody BlockedSlotRequest request) {
        BlockedSlotResponse created = availabilityService.createBlockedSlot(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Blocked slot created.", created));
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
        return ResponseEntity.ok(ApiResponse.success("Blocked slot deleted.", null));
    }
}
