// UserService.java
package com.email_server.backend.Services;

import com.email_server.backend.Dto.UserDTO;
import com.email_server.backend.Entities.User;
import com.email_server.backend.Repositories.UserRepository;
import com.email_server.backend.validation.ValidationChain;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;


@Service
public class UserService {

    private final UserRepository userRepository;
    private final ValidationChain validationChain;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, ValidationChain validationChain, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.validationChain = validationChain;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public User signup(UserDTO userDTO) {
        // Validate using chain
        String email = userDTO.getEmail().toLowerCase().trim();
        String rawPassword = userDTO.getPassword();
        validationChain.validateSignup(email, rawPassword);
        String hashedPassword = passwordEncoder.encode(rawPassword);


        // Create user with Builder pattern
        User user = User.builder()
                .email(userDTO.getEmail().toLowerCase().trim())
                .name(userDTO.getName().trim())
                .password(hashedPassword) // TODO: Hash password!
                .build();

        try {
            return userRepository.save(user);
        } catch (DataIntegrityViolationException e) {
            throw new IllegalArgumentException("Email already registered");
        }
    }

    public User login(String email, String rawPassword) {
        String normalizedEmail = email.toLowerCase().trim();

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        // Verify password using passwordEncoder.matches()
        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        return user;
    }
    // UPDATE - Modify existing user (name OR password OR both)

    @Transactional
    public User updateUser(String userId, UserDTO updateDTO) {
        // Find user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Update name if provided
        if (updateDTO.getName() != null && !updateDTO.getName().trim().isEmpty()) {
            user.setName(updateDTO.getName().trim());
        }

        // Update password if provided
        if (updateDTO.getPassword() != null && !updateDTO.getPassword().trim().isEmpty()) {
            String newPassword = updateDTO.getPassword();

            // REUSE YOUR VALIDATION CHAIN for password!
            validationChain.validatePassword(newPassword);
            user.setPassword(passwordEncoder.encode(newPassword));

        }

        // Email cannot be updated (unique constraint)
        return userRepository.save(user);
    }

    // GET - Retrieve user by ID
    public User getUserById(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    // DELETE - Remove user
    @Transactional
    public void deleteUser(String userId) {
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("User not found");
        }
        userRepository.deleteById(userId);
    }
}