// ValidationChain.java
package com.email_server.backend.validation;

import com.email_server.backend.Repositories.UserRepository;
import com.email_server.backend.Dto.UserDTO;
import org.springframework.stereotype.Component;

import java.util.Locale;

@Component
public class ValidationChain {

    private final UserRepository userRepository;

    public ValidationChain(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public void validateSignup(String email, String password) {
        // Email validation
        if (!isValidEmail(email)) {
            throw new IllegalArgumentException("Invalid email format");
        }

        // Check if email exists
        if (userRepository.existsByEmail(email.toLowerCase().trim())) {
            throw new IllegalArgumentException("Email already registered");
        }

        // Password validation (reuse your existing logic)
        validatePassword(password);
    }
    private boolean isValidEmail(String email) {
        return email != null && email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");
    }

    public void validatePassword(String password) {
        if (password == null || password.length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters");
        }

    }
}