package com.kanteelite.training.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class LegacyEndpointAccessAuditFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(LegacyEndpointAccessAuditFilter.class);

    private static final List<String> LEGACY_PREFIXES = List.of(
            "/api/staff",
            "/api/coach",
            "/api/messages",
            "/api/waivers",
            "/api/documents",
            "/api/calendar",
            "/api/enrollments",
            "/api/attendance",
            "/api/player/progress-notes",
            "/api/parent/progress-notes",
            "/api/admin/families",
            "/api/admin/coaches",
            "/api/admin/players",
            "/api/admin/recurring-schedules",
            "/api/admin/enrollments"
    );

    private final Environment environment;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        boolean auditEnabled = environment.acceptsProfiles(Profiles.of("prod"));
        boolean legacyPath = auditEnabled && isLegacyPath(request.getRequestURI());

        try {
            filterChain.doFilter(request, response);
        } finally {
            if (legacyPath) {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                String actor = auth != null ? auth.getName() : "anonymous";
                log.info("legacy-endpoint-access method={} path={} status={} actor={}",
                        request.getMethod(),
                        request.getRequestURI(),
                        response.getStatus(),
                        actor);
            }
        }
    }

    private boolean isLegacyPath(String path) {
        for (String prefix : LEGACY_PREFIXES) {
            if (path.equals(prefix) || path.startsWith(prefix + "/")) {
                return true;
            }
        }
        return false;
    }
}
