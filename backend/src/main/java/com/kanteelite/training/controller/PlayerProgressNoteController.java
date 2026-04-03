package com.kanteelite.training.controller;

import com.kanteelite.training.dto.request.PlayerProgressNoteRequest;
import com.kanteelite.training.dto.response.PlayerProgressNoteResponse;
import com.kanteelite.training.service.PlayerProgressNoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class PlayerProgressNoteController {

    private final PlayerProgressNoteService noteService;

    @PostMapping("/api/coach/progress-notes")
    public ResponseEntity<PlayerProgressNoteResponse> createNote(
            @RequestBody PlayerProgressNoteRequest request,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(noteService.createNote(request, user.getUsername(), user.getUsername()));
    }

    @GetMapping("/api/coach/progress-notes")
    public ResponseEntity<List<PlayerProgressNoteResponse>> getCoachNotes(
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(noteService.getNotesByCoach(user.getUsername()));
    }

    @PutMapping("/api/coach/progress-notes/{id}")
    public ResponseEntity<PlayerProgressNoteResponse> updateNote(
            @PathVariable Long id,
            @RequestBody PlayerProgressNoteRequest request,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(noteService.updateNote(id, request, user.getUsername()));
    }

    @DeleteMapping("/api/coach/progress-notes/{id}")
    public ResponseEntity<Void> deleteNote(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails user) {
        noteService.deleteNote(id, user.getUsername());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/players/{email}/progress-notes")
    public ResponseEntity<List<PlayerProgressNoteResponse>> getPlayerNotes(@PathVariable String email) {
        return ResponseEntity.ok(noteService.getNotesForPlayer(email));
    }

    @GetMapping("/api/player/progress-notes")
    public ResponseEntity<List<PlayerProgressNoteResponse>> getMyNotes(
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(noteService.getVisibleNotesForPlayer(user.getUsername()));
    }

    @GetMapping("/api/parent/progress-notes/{playerEmail}")
    public ResponseEntity<List<PlayerProgressNoteResponse>> getChildNotes(@PathVariable String playerEmail) {
        return ResponseEntity.ok(noteService.getVisibleNotesForPlayer(playerEmail));
    }

    @GetMapping("/api/bookings/{bookingId}/progress-notes")
    public ResponseEntity<List<PlayerProgressNoteResponse>> getByBooking(@PathVariable Long bookingId) {
        return ResponseEntity.ok(noteService.getNotesByBooking(bookingId));
    }
}
