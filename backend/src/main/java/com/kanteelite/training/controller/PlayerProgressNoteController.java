package com.kanteelite.training.controller;

import jakarta.validation.Valid;
import com.kanteelite.training.dto.request.PlayerProgressNoteRequest;
import com.kanteelite.training.dto.response.ApiResponse;
import com.kanteelite.training.dto.response.PlayerProgressNoteResponse;
import com.kanteelite.training.service.PlayerProgressNoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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
            @Valid @RequestBody PlayerProgressNoteRequest request,
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
            @Valid @RequestBody PlayerProgressNoteRequest request,
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

    /**
     * Returns progress notes for a child player that are explicitly marked visible to parents.
     *
     * <p>Full parent-child relationship verification requires a {@code playerEmail} or
     * {@code childUserId} column on {@code PlayerProfile} (schema gap). Until that column
     * exists, the following partial guards are in place:
     * <ul>
     *   <li>Only notes where {@code visibleToParent = true} are returned.</li>
     *   <li>A caller cannot use this endpoint to access their own notes (they must
     *       use {@code GET /api/player/progress-notes} instead).</li>
     * </ul>
     * TODO: add parent→child email verification once PlayerProfile stores playerEmail/childUserId.
     */
    @GetMapping("/api/parent/progress-notes/{playerEmail}")
    public ResponseEntity<?> getChildNotes(
            @PathVariable String playerEmail,
            @AuthenticationPrincipal UserDetails user) {
        if (user.getUsername().equals(playerEmail)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Players should use GET /api/player/progress-notes to view their own notes."));
        }
        return ResponseEntity.ok(noteService.getVisibleNotesForPlayer(playerEmail));
    }

    @GetMapping("/api/bookings/{bookingId}/progress-notes")
    public ResponseEntity<List<PlayerProgressNoteResponse>> getByBooking(@PathVariable Long bookingId) {
        return ResponseEntity.ok(noteService.getNotesByBooking(bookingId));
    }
}
