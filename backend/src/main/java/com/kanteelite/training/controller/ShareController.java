package com.kanteelite.training.controller;

import com.kanteelite.training.entity.Event;
import com.kanteelite.training.entity.MediaPost;
import com.kanteelite.training.entity.Program;
import com.kanteelite.training.enums.MediaType;
import com.kanteelite.training.repository.EventRepository;
import com.kanteelite.training.repository.ProgramRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.HtmlUtils;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@RestController
@RequestMapping("/api/share")
@RequiredArgsConstructor
public class ShareController {

    private static final String SITE_NAME = "Kante Elite Training";
    private static final String FALLBACK_IMAGE = "/images/coach-kante-playing-background.png";

    private final ProgramRepository programRepository;
    private final EventRepository eventRepository;

    @GetMapping(value = "/programs/{slugOrId}", produces = org.springframework.http.MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> shareProgram(@PathVariable String slugOrId, HttpServletRequest request) {
        Program program = findProgram(slugOrId);
        String origin = getOrigin(request);
        String programKey = program.getSlug() != null && !program.getSlug().isBlank()
                ? program.getSlug()
                : String.valueOf(program.getId());
        String targetPath = "/book?program=" + urlEncode(programKey);
        String sharePath = "/api/share/programs/" + urlEncode(programKey);
        String imageUrl = Optional.ofNullable(program.getMediaPost())
                .filter(media -> media.getMediaType() == MediaType.IMAGE)
                .map(MediaPost::getMediaUrl)
                .orElse(FALLBACK_IMAGE);

        return htmlResponse(buildShareHtml(
                program.getName() + " | " + SITE_NAME,
                firstPresent(program.getShortDescription(), program.getDescription(), "Book soccer training with Coach Kante."),
                absoluteUrl(origin, imageUrl),
                absoluteUrl(origin, sharePath),
                absoluteUrl(origin, targetPath)
        ));
    }

    @GetMapping(value = "/events/{id}", produces = org.springframework.http.MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> shareEvent(@PathVariable Long id, HttpServletRequest request) {
        Event event = eventRepository.findById(id)
                .filter(Event::isActive)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Event not found"));
        String origin = getOrigin(request);
        String targetPath = "/events/" + event.getId() + "/register";
        String sharePath = "/api/share/events/" + event.getId();
        String imageUrl = firstPresent(event.getPrimaryMediaUrl(), event.getSecondaryMediaUrl(), FALLBACK_IMAGE);

        return htmlResponse(buildShareHtml(
                event.getTitle() + " | " + SITE_NAME,
                firstPresent(event.getDescription(), null, "Register for " + event.getTitle() + " with Kante Elite Training."),
                absoluteUrl(origin, imageUrl),
                absoluteUrl(origin, sharePath),
                absoluteUrl(origin, targetPath)
        ));
    }

    private Program findProgram(String slugOrId) {
        Optional<Program> bySlug = programRepository.findBySlugAndActiveTrue(slugOrId);
        if (bySlug.isPresent()) {
            return bySlug.get();
        }

        try {
            Long id = Long.parseLong(slugOrId);
            return programRepository.findById(id)
                    .filter(Program::isActive)
                    .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Program not found"));
        } catch (NumberFormatException exception) {
            throw new ResponseStatusException(NOT_FOUND, "Program not found");
        }
    }

    private ResponseEntity<String> htmlResponse(String body) {
        return ResponseEntity.ok()
                .contentType(org.springframework.http.MediaType.TEXT_HTML)
                .body(body);
    }

    private String buildShareHtml(String title, String description, String imageUrl, String shareUrl, String targetUrl) {
        String safeTitle = escape(title);
        String safeDescription = escape(truncate(description, 180));
        String safeImageUrl = escape(imageUrl);
        String safeShareUrl = escape(shareUrl);
        String safeTargetUrl = escape(targetUrl);

        return """
                <!doctype html>
                <html lang="en">
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                  <title>%s</title>
                  <meta name="description" content="%s">
                  <meta property="og:type" content="website">
                  <meta property="og:site_name" content="%s">
                  <meta property="og:title" content="%s">
                  <meta property="og:description" content="%s">
                  <meta property="og:image" content="%s">
                  <meta property="og:url" content="%s">
                  <meta name="twitter:card" content="summary_large_image">
                  <meta name="twitter:title" content="%s">
                  <meta name="twitter:description" content="%s">
                  <meta name="twitter:image" content="%s">
                  <link rel="canonical" href="%s">
                  <meta http-equiv="refresh" content="0; url=%s">
                  <style>
                    body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #050505; color: #fff; font-family: Arial, sans-serif; }
                    main { max-width: 560px; padding: 32px; text-align: center; }
                    a { display: inline-block; margin-top: 18px; padding: 14px 22px; border-radius: 12px; background: #f59e0b; color: #050505; font-weight: 900; text-decoration: none; }
                  </style>
                </head>
                <body>
                  <main>
                    <h1>%s</h1>
                    <p>%s</p>
                    <a href="%s">Continue to booking</a>
                  </main>
                  <script>window.location.replace("%s");</script>
                </body>
                </html>
                """.formatted(
                safeTitle,
                safeDescription,
                escape(SITE_NAME),
                safeTitle,
                safeDescription,
                safeImageUrl,
                safeShareUrl,
                safeTitle,
                safeDescription,
                safeImageUrl,
                safeTargetUrl,
                safeTargetUrl,
                safeTitle,
                safeDescription,
                safeTargetUrl,
                safeTargetUrl
        );
    }

    private String getOrigin(HttpServletRequest request) {
        String forwardedProto = request.getHeader("X-Forwarded-Proto");
        String forwardedHost = request.getHeader("X-Forwarded-Host");
        String proto = forwardedProto != null && !forwardedProto.isBlank() ? forwardedProto : request.getScheme();
        String host = forwardedHost != null && !forwardedHost.isBlank() ? forwardedHost : request.getServerName();
        if (forwardedHost == null || forwardedHost.isBlank()) {
            int port = request.getServerPort();
            boolean defaultPort = ("https".equalsIgnoreCase(proto) && port == 443)
                    || ("http".equalsIgnoreCase(proto) && port == 80);
            if (!defaultPort) {
                host = host + ":" + port;
            }
        }
        return proto + "://" + host;
    }

    private String absoluteUrl(String origin, String value) {
        if (value == null || value.isBlank()) {
            return origin + FALLBACK_IMAGE;
        }
        if (value.startsWith("http://") || value.startsWith("https://")) {
            return value;
        }
        return origin + (value.startsWith("/") ? value : "/" + value);
    }

    private String firstPresent(String first, String second, String fallback) {
        if (first != null && !first.isBlank()) {
            return first;
        }
        if (second != null && !second.isBlank()) {
            return second;
        }
        return fallback;
    }

    private String truncate(String value, int maxLength) {
        String normalized = value == null ? "" : value.replaceAll("\\s+", " ").trim();
        if (normalized.length() <= maxLength) {
            return normalized;
        }
        return normalized.substring(0, Math.max(0, maxLength - 3)).trim() + "...";
    }

    private String escape(String value) {
        return HtmlUtils.htmlEscape(value == null ? "" : value);
    }

    private String urlEncode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
