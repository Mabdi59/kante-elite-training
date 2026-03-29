package com.kanteelite.training.controller;

import com.kanteelite.training.dto.request.ContactRequest;
import com.kanteelite.training.dto.response.ApiResponse;
import com.kanteelite.training.service.ContactService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contact")
@RequiredArgsConstructor
public class ContactController {

    private final ContactService contactService;

    @PostMapping
    public ResponseEntity<ApiResponse<Void>> submitContact(@Valid @RequestBody ContactRequest request) {
        contactService.submitContactMessage(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<Void>builder()
                        .success(true)
                        .message("Thank you for reaching out! We'll get back to you within 24 hours.")
                        .build());
    }
}
