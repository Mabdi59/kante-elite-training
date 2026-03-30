package com.kanteelite.training.config;

import com.kanteelite.training.entity.User;
import com.kanteelite.training.enums.UserRole;
import com.kanteelite.training.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class AdminUserInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminUserInitializer.class);

    private static final String DEFAULT_ADMIN_EMAIL = "admin@kanteelite.com";
    private static final String DEFAULT_ADMIN_PASSWORD = "admin123";

    @Value("${app.admin.email:admin@kanteelite.com}")
    private String adminEmail;

    @Value("${app.admin.password:admin123}")
    private String adminPassword;

    @Value("${app.admin.name:Kante Elite Admin}")
    private String adminName;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        warnIfUsingDefaults();
        userRepository.findByEmail(adminEmail)
                .ifPresentOrElse(this::ensureAdminRole, this::createDefaultAdminUser);
    }

    private void warnIfUsingDefaults() {
        if (DEFAULT_ADMIN_EMAIL.equals(adminEmail) || DEFAULT_ADMIN_PASSWORD.equals(adminPassword)) {
            log.warn("=============================================================");
            log.warn("WARNING: Default admin credentials are in use.");
            log.warn("Set ADMIN_EMAIL, ADMIN_PASSWORD, and ADMIN_NAME env variables");
            log.warn("before deploying to production.");
            log.warn("=============================================================");
        }
    }

    private void ensureAdminRole(User user) {
        if (user.getRole() != UserRole.ADMIN) {
            user.setRole(UserRole.ADMIN);
            userRepository.save(user);
            log.info("Promoted existing user to ADMIN: {}", adminEmail);
            return;
        }
        log.info("Admin user already present: {}", adminEmail);
    }

    private void createDefaultAdminUser() {
        User adminUser = User.builder()
                .name(adminName)
                .email(adminEmail)
                .password(passwordEncoder.encode(adminPassword))
                .role(UserRole.ADMIN)
                .build();

        userRepository.save(adminUser);
        log.info("Created default admin user: {}", adminEmail);
    }
}
