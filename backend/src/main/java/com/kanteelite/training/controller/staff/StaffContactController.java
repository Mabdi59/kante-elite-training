package com.kanteelite.training.controller.staff;

import com.kanteelite.training.dto.response.ApiResponse;
import com.kanteelite.training.dto.response.ContactMessageResponse;
import com.kanteelite.training.service.ContactService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/staff/messages")
@RequiredArgsConstructor
public class StaffContactController {

    private final ContactService contactService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ContactMessageResponse>>> getAllMessages() {
        return ResponseEntity.ok(ApiResponse.success(contactService.getAllMessages()));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<ContactMessageResponse>> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Message marked as read.", contactService.markAsRead(id)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMessage(@PathVariable Long id) {
        contactService.deleteMessage(id);
        return ResponseEntity.ok(ApiResponse.success("Message deleted.", null));
    }
}
