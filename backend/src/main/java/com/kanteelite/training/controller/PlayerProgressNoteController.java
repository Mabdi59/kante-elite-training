package com.kanteelite.training.controller;

import jakarta.validation.Valid;
import com.kanteelite.training.dto.request.PlayerProgressNoteRequest;
import com.kanteelite.training.dto.response.ApiResponse;
import com.kanteelite.training.dto.response.PlayerProgressNoteResponse;
import com.kanteelite.training.service.PlayerProgressNoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class PlayerProgressNoteController {

    private final PlayerProgressNoteService noteService;

    @PostMapping("/api/coach/progress-notes")
    public ResponseEntity<ApiResponse<PlayerProgressNoteResponse>> createNote(
            @Valid @RequestBody PlayerProgressNoteRequest request,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(ApiResponse.success(noteService.createNote(request, user.getUsername(), user.getUsername())));
    }

    @GetMapping("/api/coach/progress-notes")
    public ResponseEntity<ApiResponse<List<PlayerProgressNoteResponse>>> getCoachNotes(
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(ApiResponse.success(noteService.getNotesByCoach(user.getUsername())));
    }

    @PutMapping("/api/coach/progress-notes/{id}")
    public ResponseEntity<ApiResponse<PlayerProgressNoteResponse>> updateNote(
            @PathVariable Long id,
            @Valid @RequestBody PlayerProgressNoteRequest request,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(ApiResponse.success(noteService.updateNote(id, request, user.getUsername())));
    }

    @DeleteMapping("/api/coach/progress-notes/{id}")
    public ResponseEntity<Void> deleteNote(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails user) {
        noteService.deleteNote(id, user.getUsername());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/players/{email}/progress-notes")
    public ResponseEntity<ApiResponse<List<PlayerProgressNoteResponse>>> getPlayerNotes(@PathVariable String email) {
        return ResponseEntity.ok(ApiResponse.success(noteService.getNotesForPlayer(email)));
    }

    @GetMapping("/api/player/progress-notes")
    public ResponseEntity<ApiResponse<List<PlayerProgressNoteResponse>>> getMyNotes(
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(ApiResponse.success(noteService.getVisibleNotesForPlayer(user.getUsername())));
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
    public ResponseEntity<ApiResponse<List<PlayerProgressNoteResponse>>> getChildNotes(
            @PathVariable String playerEmail,
            @AuthenticationPrincipal UserDetails user) {
        // Hardened: disable direct parent-by-email lookups until profile-linked ownership
        // verification is available in schema.
        boolean privileged = user.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role -> "ROLE_ADMIN".equals(role)
                        || "ROLE_STAFF".equals(role)
                        || "ROLE_COACH".equals(role));
        if (!privileged) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Parent progress-note lookup by player email is disabled until profile-linked verification is available."));
        }

        String normalizedPlayerEmail = playerEmail.trim().toLowerCase();
        if (user.getUsername().equals(normalizedPlayerEmail)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Players should use GET /api/player/progress-notes to view their own notes."));
        }
        return ResponseEntity.ok(ApiResponse.success(noteService.getVisibleNotesForPlayer(normalizedPlayerEmail)));
    }

    @GetMapping("/api/bookings/{bookingId}/progress-notes")
    public ResponseEntity<ApiResponse<List<PlayerProgressNoteResponse>>> getByBooking(@PathVariable Long bookingId) {
        return ResponseEntity.ok(ApiResponse.success(noteService.getNotesByBooking(bookingId)));
    }
}
