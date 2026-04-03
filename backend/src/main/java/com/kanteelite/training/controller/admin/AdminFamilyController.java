package com.kanteelite.training.controller.admin;

import com.kanteelite.training.dto.request.FamilyOnboardingRequest;
import com.kanteelite.training.dto.response.AdminFamiliesListResponse;
import com.kanteelite.training.dto.response.ApiResponse;
import com.kanteelite.training.dto.response.FamilyDetailResponse;
import com.kanteelite.training.service.FamilyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/families")
@RequiredArgsConstructor
public class AdminFamilyController {

    private final FamilyService familyService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AdminFamiliesListResponse>>> listFamilies() {
        return ResponseEntity.ok(ApiResponse.success(familyService.getFamilies()));
    }

    @PostMapping("/onboard")
    public ResponseEntity<ApiResponse<FamilyDetailResponse>> onboardFamily(
            @RequestBody FamilyOnboardingRequest request,
            @AuthenticationPrincipal UserDetails principal) {
        String actor = principal != null ? principal.getUsername() : "admin";
        FamilyDetailResponse result = familyService.onboardFamily(request, actor);
        return ResponseEntity.ok(ApiResponse.success("Family onboarded successfully.", result));
    }

    @GetMapping("/{parentUserId}")
    public ResponseEntity<ApiResponse<FamilyDetailResponse>> getFamily(@PathVariable Long parentUserId) {
        return ResponseEntity.ok(ApiResponse.success(familyService.getFamily(parentUserId)));
    }

    @PutMapping("/{parentUserId}")
    public ResponseEntity<ApiResponse<FamilyDetailResponse>> updateFamily(
            @PathVariable Long parentUserId,
            @RequestBody FamilyOnboardingRequest request,
            @AuthenticationPrincipal UserDetails principal) {
        String actor = principal != null ? principal.getUsername() : "admin";
        FamilyDetailResponse result = familyService.updateFamilyParent(parentUserId, request, actor);
        return ResponseEntity.ok(ApiResponse.success("Family updated successfully.", result));
    }
}
