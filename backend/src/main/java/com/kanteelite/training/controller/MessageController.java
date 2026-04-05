package com.kanteelite.training.controller;

import com.kanteelite.training.dto.request.MessageRequest;
import com.kanteelite.training.dto.response.MessageResponse;
import com.kanteelite.training.entity.User;
import com.kanteelite.training.repository.UserRepository;
import com.kanteelite.training.service.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<MessageResponse> send(
            @Valid @RequestBody MessageRequest request,
            @AuthenticationPrincipal UserDetails user) {
        String email = user.getUsername();
        String name = userRepository.findByEmail(email)
                .map(User::getName)
                .orElse(email);
        return ResponseEntity.ok(messageService.sendMessage(request, email, name));
    }

    @GetMapping("/inbox")
    public ResponseEntity<List<MessageResponse>> inbox(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(messageService.getInbox(user.getUsername()));
    }

    @GetMapping("/sent")
    public ResponseEntity<List<MessageResponse>> sent(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(messageService.getSent(user.getUsername()));
    }

    @GetMapping("/unread")
    public ResponseEntity<List<MessageResponse>> unread(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(messageService.getUnread(user.getUsername()));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> unreadCount(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(Map.of("count", messageService.getUnreadCount(user.getUsername())));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<MessageResponse> markAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(messageService.markAsRead(id, user.getUsername()));
    }

    @GetMapping("/thread/{parentId}")
    public ResponseEntity<List<MessageResponse>> thread(@PathVariable Long parentId) {
        return ResponseEntity.ok(messageService.getThread(parentId));
    }
}
