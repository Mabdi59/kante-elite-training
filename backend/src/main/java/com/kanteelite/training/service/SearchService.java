package com.kanteelite.training.service;

import com.kanteelite.training.repository.BookingRepository;
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

        return results;
    }
}
