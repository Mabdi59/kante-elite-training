package com.kanteelite.training.service;

import com.kanteelite.training.repository.BookingRepository;
import com.kanteelite.training.repository.CoachProfileRepository;
import com.kanteelite.training.repository.ProgramRepository;
import com.kanteelite.training.repository.TournamentRepository;
import com.kanteelite.training.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SearchService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final ProgramRepository programRepository;
    private final TournamentRepository tournamentRepository;
    private final CoachProfileRepository coachProfileRepository;

    @Transactional(readOnly = true)
    public Map<String, Object> search(String query) {
        Map<String, Object> results = new HashMap<>();
        String q = query == null ? "" : query.trim();
        if (q.isBlank()) {
            results.put("bookings", java.util.List.of());
            results.put("users", java.util.List.of());
            results.put("programs", java.util.List.of());
            results.put("tournaments", java.util.List.of());
            results.put("coaches", java.util.List.of());
            return results;
        }

        results.put("bookings", bookingRepository.searchByQuery(q, PageRequest.of(0, 20)).stream()
                .map(b -> Map.of(
                        "id", b.getId(),
                        "type", "booking",
                        "label", b.getPlayerName() + " – " + b.getProgram().getName(),
                        "email", b.getEmail(),
                        "date", b.getBookingDate().toString()
                ))
                .toList());

        results.put("users", userRepository.searchByQuery(q, PageRequest.of(0, 20)).stream()
                .map(u -> Map.of(
                        "id", u.getId(),
                        "type", "user",
                        "label", u.getName() != null ? u.getName() : u.getEmail(),
                        "email", u.getEmail(),
                        "role", u.getRole().name()
                ))
                .toList());

        results.put("programs", programRepository.searchByQuery(q, PageRequest.of(0, 10)).stream()
                .map(p -> Map.of(
                        "id", p.getId(),
                        "type", "program",
                        "label", p.getName(),
                        "status", p.getStatus()
                ))
                .toList());

        results.put("tournaments", tournamentRepository.searchByQuery(q, PageRequest.of(0, 10)).stream()
                .map(t -> Map.of(
                        "id", t.getId(),
                        "type", "tournament",
                        "label", t.getName()
                ))
                .toList());

        results.put("coaches", coachProfileRepository.searchByQuery(q, PageRequest.of(0, 10)).stream()
                .map(c -> Map.of(
                        "id", c.getId(),
                        "type", "coach",
                        "label", c.getUser().getName() != null ? c.getUser().getName() : c.getUser().getEmail(),
                        "email", c.getUser().getEmail()
                ))
                .toList());

        return results;
    }
}
