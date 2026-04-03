package com.kanteelite.training.service;

import com.kanteelite.training.dto.request.PlayerProgressNoteRequest;
import com.kanteelite.training.dto.response.PlayerProgressNoteResponse;
import com.kanteelite.training.entity.Booking;
import com.kanteelite.training.entity.PlayerProgressNote;
import com.kanteelite.training.exception.ResourceNotFoundException;
import com.kanteelite.training.repository.BookingRepository;
import com.kanteelite.training.repository.PlayerProgressNoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PlayerProgressNoteService {

    private final PlayerProgressNoteRepository noteRepository;
    private final BookingRepository bookingRepository;
    private final AuditLogService auditLogService;

    @Transactional
    public PlayerProgressNoteResponse createNote(PlayerProgressNoteRequest request,
                                                  String coachEmail, String coachName) {
        Booking booking = null;
        if (request.getBookingId() != null) {
            booking = bookingRepository.findById(request.getBookingId()).orElse(null);
        }

        PlayerProgressNote note = PlayerProgressNote.builder()
                .playerEmail(request.getPlayerEmail().trim().toLowerCase())
                .playerName(request.getPlayerName())
                .coachEmail(coachEmail.trim().toLowerCase())
                .coachName(coachName)
                .sessionDate(request.getSessionDate() != null ? request.getSessionDate() : LocalDate.now())
                .noteType(request.getNoteType() != null ? request.getNoteType() : "GENERAL")
                .title(request.getTitle())
                .content(request.getContent())
                .rating(request.getRating())
                .visibleToParent(request.isVisibleToParent())
                .booking(booking)
                .build();

        PlayerProgressNote saved = noteRepository.save(note);
        auditLogService.log(coachEmail, "CREATE", "PlayerProgressNote", saved.getId(),
                "Coach note for " + request.getPlayerEmail());
        return toResponse(saved);
    }

    @Transactional
    public PlayerProgressNoteResponse updateNote(Long id, PlayerProgressNoteRequest request, String coachEmail) {
        PlayerProgressNote note = noteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PlayerProgressNote", id));
        if (!note.getCoachEmail().equalsIgnoreCase(coachEmail)) {
            throw new IllegalArgumentException("You are not authorized to update this note.");
        }
        note.setTitle(request.getTitle());
        note.setContent(request.getContent());
        note.setRating(request.getRating());
        if (request.getNoteType() != null) {
            note.setNoteType(request.getNoteType());
        }
        note.setVisibleToParent(request.isVisibleToParent());
        return toResponse(noteRepository.save(note));
    }

    @Transactional
    public void deleteNote(Long id, String actorEmail) {
        PlayerProgressNote note = noteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PlayerProgressNote", id));
        noteRepository.delete(note);
        auditLogService.log(actorEmail, "DELETE", "PlayerProgressNote", id, "Deleted note");
    }

    @Transactional(readOnly = true)
    public List<PlayerProgressNoteResponse> getNotesForPlayer(String playerEmail) {
        return noteRepository.findByPlayerEmailIgnoreCaseOrderBySessionDateDesc(playerEmail).stream()
                .map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<PlayerProgressNoteResponse> getVisibleNotesForPlayer(String playerEmail) {
        return noteRepository.findByPlayerEmailIgnoreCaseAndVisibleToParentTrueOrderBySessionDateDesc(playerEmail)
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<PlayerProgressNoteResponse> getNotesByCoach(String coachEmail) {
        return noteRepository.findByCoachEmailIgnoreCaseOrderBySessionDateDesc(coachEmail).stream()
                .map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<PlayerProgressNoteResponse> getNotesByBooking(Long bookingId) {
        return noteRepository.findByBookingIdOrderByCreatedAtDesc(bookingId).stream()
                .map(this::toResponse).toList();
    }

    public PlayerProgressNoteResponse toResponse(PlayerProgressNote n) {
        return PlayerProgressNoteResponse.builder()
                .id(n.getId())
                .playerEmail(n.getPlayerEmail())
                .playerName(n.getPlayerName())
                .coachEmail(n.getCoachEmail())
                .coachName(n.getCoachName())
                .sessionDate(n.getSessionDate())
                .noteType(n.getNoteType())
                .title(n.getTitle())
                .content(n.getContent())
                .rating(n.getRating())
                .visibleToParent(n.isVisibleToParent())
                .bookingId(n.getBooking() != null ? n.getBooking().getId() : null)
                .createdAt(n.getCreatedAt())
                .build();
    }
}
