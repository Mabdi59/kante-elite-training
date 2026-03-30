package com.kanteelite.training.config;

import com.kanteelite.training.entity.User;
import com.kanteelite.training.enums.UserRole;
import com.kanteelite.training.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class AdminUserInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminUserInitializer.class);

    private static final String DEFAULT_ADMIN_NAME = "Kante Elite Admin";
    private static final String DEFAULT_ADMIN_EMAIL = "admin@kanteelite.com";
    private static final String DEFAULT_ADMIN_PASSWORD = "admin123";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        userRepository.findByEmail(DEFAULT_ADMIN_EMAIL)
                .ifPresentOrElse(this::syncExistingAdminUser, this::createDefaultAdminUser);
    }

    private void syncExistingAdminUser(User user) {
        boolean updated = false;

        if (user.getRole() != UserRole.ADMIN) {
            user.setRole(UserRole.ADMIN);
            updated = true;
        }

        if (!passwordEncoder.matches(DEFAULT_ADMIN_PASSWORD, user.getPassword())) {
            user.setPassword(passwordEncoder.encode(DEFAULT_ADMIN_PASSWORD));
            updated = true;
        }

        if (user.getName() == null || user.getName().isBlank()) {
            user.setName(DEFAULT_ADMIN_NAME);
            updated = true;
        }

        if (updated) {
            userRepository.save(user);
            log.info("Updated default admin user: {}", DEFAULT_ADMIN_EMAIL);
            return;
        }

        log.info("Default admin user already available: {}", DEFAULT_ADMIN_EMAIL);
    }

    private void createDefaultAdminUser() {
        User adminUser = User.builder()
                .name(DEFAULT_ADMIN_NAME)
                .email(DEFAULT_ADMIN_EMAIL)
                .password(passwordEncoder.encode(DEFAULT_ADMIN_PASSWORD))
                .role(UserRole.ADMIN)
                .build();

        userRepository.save(adminUser);
        log.info("Created default admin user: {}", DEFAULT_ADMIN_EMAIL);
    }
}
