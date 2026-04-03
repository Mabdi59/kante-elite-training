package com.kanteelite.training.service;

import com.kanteelite.training.repository.BookingRepository;
import com.kanteelite.training.repository.CoachProfileRepository;
import com.kanteelite.training.repository.ProgramRepository;
import com.kanteelite.training.repository.TournamentRepository;
import com.kanteelite.training.repository.UserRepository;
import lombok.RequiredArgsConstructor;
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
        String q = query == null ? "" : query.trim().toLowerCase();

        results.put("bookings", bookingRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(b -> b.getPlayerName().toLowerCase().contains(q)
                        || b.getEmail().toLowerCase().contains(q)
                        || (b.getParentName() != null && b.getParentName().toLowerCase().contains(q)))
                .limit(20)
                .map(b -> Map.of(
                        "id", b.getId(),
                        "type", "booking",
                        "label", b.getPlayerName() + " – " + b.getProgram().getName(),
                        "email", b.getEmail(),
                        "date", b.getBookingDate().toString()
                ))
                .toList());

        results.put("users", userRepository.findAll().stream()
                .filter(u -> u.getEmail().toLowerCase().contains(q)
                        || (u.getName() != null && u.getName().toLowerCase().contains(q)))
                .limit(20)
                .map(u -> Map.of(
                        "id", u.getId(),
                        "type", "user",
                        "label", u.getEmail(),
                        "email", u.getEmail(),
                        "role", u.getRole().name()
                ))
                .toList());

        results.put("programs", programRepository.findAll().stream()
                .filter(p -> p.getName().toLowerCase().contains(q)
                        || (p.getDescription() != null && p.getDescription().toLowerCase().contains(q)))
                .limit(10)
                .map(p -> Map.of(
                        "id", p.getId(),
                        "type", "program",
                        "label", p.getName(),
                        "status", p.getStatus()
                ))
                .toList());

        results.put("tournaments", tournamentRepository.findAll().stream()
                .filter(t -> t.getName() != null && t.getName().toLowerCase().contains(q))
                .limit(10)
                .map(t -> Map.of(
                        "id", t.getId(),
                        "type", "tournament",
                        "label", t.getName()
                ))
                .toList());

        results.put("coaches", coachProfileRepository.findAll().stream()
                .filter(c -> (c.getUser().getName() != null && c.getUser().getName().toLowerCase().contains(q))
                        || (c.getBio() != null && c.getBio().toLowerCase().contains(q))
                        || (c.getSpecialties() != null && c.getSpecialties().toLowerCase().contains(q)))
                .limit(10)
                .map(c -> Map.of(
                        "id", c.getId(),
                        "type", "coach",
                        "label", c.getUser().getName(),
                        "email", c.getUser().getEmail()
                ))
                .toList());

        return results;
    }
}
