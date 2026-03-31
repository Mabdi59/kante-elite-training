package com.kanteelite.training.config;

import com.kanteelite.training.security.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import jakarta.servlet.http.HttpServletResponse;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Value("${app.cors.allowed-origins:http://localhost:5173}")
    private String allowedOriginsProperty;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((request, response, authException) ->
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED))
                .accessDeniedHandler((request, response, accessDeniedException) ->
                    response.sendError(HttpServletResponse.SC_FORBIDDEN))
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.POST, "/api/auth/claim-team-captain").authenticated()
                // Public auth endpoints
                .requestMatchers("/api/auth/**").permitAll()
                // Public read endpoints
                .requestMatchers(HttpMethod.GET, "/api/programs/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/events/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/testimonials/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/availability/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/tournaments/*/registrations").hasAnyRole("ADMIN", "STAFF")
                // Legacy token-based registration access requires authentication
                .requestMatchers("/api/tournaments/registrations/access/**").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/tournaments/**").permitAll()
                // Public write endpoints
                .requestMatchers(HttpMethod.POST, "/api/bookings").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/contact").permitAll()
                // Team registration requires authentication
                .requestMatchers(HttpMethod.POST, "/api/teams/register").authenticated()
                // Admin-only: tournament mutations and admin panel
                .requestMatchers(HttpMethod.POST, "/api/tournaments/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/tournaments/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/tournaments/**").hasRole("ADMIN")
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                // Staff operations endpoints
                .requestMatchers("/api/staff/**").hasAnyRole("ADMIN", "STAFF")
                // Team captain endpoints
                .requestMatchers("/api/captain/**").hasAnyRole("ADMIN", "TEAM_CAPTAIN", "COACH")
                // Coach public endpoint
                .requestMatchers(HttpMethod.GET, "/api/coach/public").permitAll()
                // Coach authenticated endpoints
                .requestMatchers("/api/coach/**").hasAnyRole("ADMIN", "COACH")
                // Stripe webhook (public)
                .requestMatchers("/api/payments/**").permitAll()
                // All other requests require authentication
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        List<String> allowedOrigins = Arrays.stream(allowedOriginsProperty.split(","))
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .collect(Collectors.toList());
        List<String> exactOrigins = allowedOrigins.stream()
                .filter(origin -> !origin.contains("*"))
                .toList();
        List<String> originPatterns = allowedOrigins.stream()
                .filter(origin -> origin.contains("*"))
                .toList();

        if (!exactOrigins.isEmpty()) {
            config.setAllowedOrigins(exactOrigins);
        }
        if (!originPatterns.isEmpty()) {
            config.setAllowedOriginPatterns(originPatterns);
        }
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }
}
