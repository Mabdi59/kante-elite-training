package com.kanteelite.training.controller.admin;

import com.kanteelite.training.dto.request.CoachProfileRequest;
import com.kanteelite.training.dto.response.ApiResponse;
import com.kanteelite.training.dto.response.CoachProfileResponse;
import com.kanteelite.training.service.CoachProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/coaches")
@RequiredArgsConstructor
public class AdminCoachController {

    private final CoachProfileService coachProfileService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CoachProfileResponse>>> getAllCoaches() {
        return ResponseEntity.ok(ApiResponse.success(coachProfileService.getAllCoaches()));
    }

    @PostMapping("/{userId}")
    public ResponseEntity<ApiResponse<CoachProfileResponse>> createCoachProfile(
            @PathVariable Long userId,
            @RequestBody CoachProfileRequest request) {
        CoachProfileResponse created = coachProfileService.create(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Coach profile created.", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CoachProfileResponse>> updateCoachProfile(
            @PathVariable Long id,
            @RequestBody CoachProfileRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Coach profile updated.",
                coachProfileService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCoachProfile(@PathVariable Long id) {
        coachProfileService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Coach profile deleted.", null));
    }
}
