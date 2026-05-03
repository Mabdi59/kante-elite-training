package com.kanteelite.training.controller;

import com.kanteelite.training.dto.request.CoachProfileRequest;
import com.kanteelite.training.dto.response.ApiResponse;
import com.kanteelite.training.dto.response.CoachProfileResponse;
import com.kanteelite.training.service.CoachProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/coach")
@RequiredArgsConstructor
public class CoachController {

    private final CoachProfileService coachProfileService;

    @GetMapping("/public")
    public ResponseEntity<ApiResponse<List<CoachProfileResponse>>> getPublicCoaches(
            @RequestParam(required = false, defaultValue = "false") boolean featured) {
        List<CoachProfileResponse> coaches = featured
                ? coachProfileService.getFeaturedCoaches()
                : coachProfileService.getActiveCoaches();
        return ResponseEntity.ok(ApiResponse.success(coaches));
    }

}
