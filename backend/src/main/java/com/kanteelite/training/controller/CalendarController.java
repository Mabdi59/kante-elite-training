package com.kanteelite.training.controller;

import com.kanteelite.training.dto.request.CalendarEventRequest;
import com.kanteelite.training.dto.response.CalendarEventResponse;
import com.kanteelite.training.service.CalendarService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/calendar")
@RequiredArgsConstructor
public class CalendarController {

    private final CalendarService calendarService;

    @GetMapping
    public ResponseEntity<List<CalendarEventResponse>> getMyEvents(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(calendarService.getEventsForUser(user.getUsername(), from, to));
    }

    @GetMapping("/all")
    public ResponseEntity<List<CalendarEventResponse>> getAllEvents(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        return ResponseEntity.ok(calendarService.getAllEvents(from, to));
    }

    @PostMapping
    public ResponseEntity<CalendarEventResponse> createEvent(
            @RequestBody CalendarEventRequest request,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(calendarService.createEvent(request, user.getUsername()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails user) {
        calendarService.deleteEvent(id, user.getUsername());
        return ResponseEntity.noContent().build();
    }

    @GetMapping(value = "/{userEmail}.ics", produces = "text/calendar")
    public ResponseEntity<String> exportIcal(@PathVariable String userEmail) {
        LocalDateTime from = LocalDateTime.now().minusMonths(1);
        LocalDateTime to = LocalDateTime.now().plusMonths(3);
        List<CalendarEventResponse> events = calendarService.getEventsForUser(userEmail, from, to);

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss'Z'");
        StringBuilder sb = new StringBuilder();
        sb.append("BEGIN:VCALENDAR\r\n");
        sb.append("VERSION:2.0\r\n");
        sb.append("PRODID:-//Kante Elite Training//Academy Calendar//EN\r\n");
        sb.append("CALSCALE:GREGORIAN\r\n");
        sb.append("METHOD:PUBLISH\r\n");
        sb.append("X-WR-CALNAME:Kante Elite Academy\r\n");

        for (CalendarEventResponse event : events) {
            sb.append("BEGIN:VEVENT\r\n");
            sb.append("UID:").append(event.getEventType()).append("-").append(event.getId())
              .append("@kanteelite.com\r\n");
            sb.append("DTSTART:").append(event.getStartAt().atZone(ZoneOffset.UTC).format(fmt)).append("\r\n");
            if (event.getEndAt() != null) {
                sb.append("DTEND:").append(event.getEndAt().atZone(ZoneOffset.UTC).format(fmt)).append("\r\n");
            }
            sb.append("SUMMARY:").append(escapeIcal(event.getTitle())).append("\r\n");
            if (event.getDescription() != null) {
                sb.append("DESCRIPTION:").append(escapeIcal(event.getDescription())).append("\r\n");
            }
            if (event.getLocation() != null) {
                sb.append("LOCATION:").append(escapeIcal(event.getLocation())).append("\r\n");
            }
            sb.append("END:VEVENT\r\n");
        }
        sb.append("END:VCALENDAR\r\n");

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=\"kante-academy.ics\"")
                .body(sb.toString());
    }

    private String escapeIcal(String value) {
        if (value == null) return "";
        return value.replace("\\", "\\\\")
                    .replace(";", "\\;")
                    .replace(",", "\\,")
                    .replace("\n", "\\n")
                    .replace("\r", "");
    }
}
