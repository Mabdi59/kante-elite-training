package com.kanteelite.training.controller;

import com.kanteelite.training.dto.response.ApiResponse;
import com.kanteelite.training.dto.response.TestimonialResponse;
import com.kanteelite.training.service.TestimonialService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/testimonials")
@RequiredArgsConstructor
public class TestimonialController {

    private final TestimonialService testimonialService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TestimonialResponse>>> getAllTestimonials() {
        return ResponseEntity.ok(ApiResponse.success(testimonialService.getAllTestimonials()));
    }

    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<List<TestimonialResponse>>> getFeaturedTestimonials() {
        return ResponseEntity.ok(ApiResponse.success(testimonialService.getFeaturedTestimonials()));
    }
}
