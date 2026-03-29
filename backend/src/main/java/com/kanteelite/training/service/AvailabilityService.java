package com.kanteelite.training.service;

import com.kanteelite.training.dto.response.AvailabilityResponse;
import com.kanteelite.training.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AvailabilityService {

    private final BookingRepository bookingRepository;

    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("h:mm a");
    private static final LocalTime START_HOUR = LocalTime.of(8, 0);
    private static final LocalTime END_HOUR = LocalTime.of(18, 0);
    private static final int SLOT_MINUTES = 60;

    public AvailabilityResponse getAvailability(Long programId, LocalDate date) {
        List<String> booked = bookingRepository.findBookedTimesByProgramAndDate(programId, date);
        List<String> allSlots = generateTimeSlots();
        List<String> available = allSlots.stream()
                .filter(slot -> !booked.contains(slot))
                .toList();

        return AvailabilityResponse.builder()
                .programId(programId)
                .date(date.toString())
                .bookedSlots(booked)
                .availableSlots(available)
                .build();
    }

    private List<String> generateTimeSlots() {
        List<String> slots = new ArrayList<>();
        LocalTime current = START_HOUR;
        while (current.isBefore(END_HOUR)) {
            slots.add(current.format(TIME_FMT));
            current = current.plusMinutes(SLOT_MINUTES);
        }
        return slots;
    }
}
