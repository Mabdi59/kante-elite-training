package com.kanteelite.training.controller.admin;

import com.kanteelite.training.dto.request.TestimonialRequest;
import com.kanteelite.training.dto.response.ApiResponse;
import com.kanteelite.training.dto.response.TestimonialResponse;
import com.kanteelite.training.service.TestimonialService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/testimonials")
@RequiredArgsConstructor
public class AdminTestimonialController {

    private final TestimonialService testimonialService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TestimonialResponse>>> getAllTestimonials() {
        return ResponseEntity.ok(ApiResponse.success(testimonialService.getAllAdminTestimonials()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TestimonialResponse>> createTestimonial(
            @Valid @RequestBody TestimonialRequest request) {
        TestimonialResponse created = testimonialService.createTestimonial(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Testimonial created.", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TestimonialResponse>> updateTestimonial(
            @PathVariable Long id, @Valid @RequestBody TestimonialRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Testimonial updated.", testimonialService.updateTestimonial(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTestimonial(@PathVariable Long id) {
        testimonialService.deleteTestimonial(id);
        return ResponseEntity.ok(ApiResponse.success("Testimonial deleted.", null));
    }
}
