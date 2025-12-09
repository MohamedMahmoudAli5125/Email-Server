//package Email_server.Backend.services;
//
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import Email_server.Backend.Dto.UserDTO;
//import Email_server.Backend.Entities.User;
//import Email_server.Backend.Repositories.UserRepository;
//import Email_server.Backend.patterns.Factory;
//
//@Service
//public class UserService {
//     private final UserRepository userRepository;
//
//    public UserService(UserRepository userRepository) {
//        this.userRepository = userRepository;
//    }
//    // chenck not exist before
//    // build user
//    // in user in dto we make @Email which is validation
//    @Transactional
//    public User registerUser(UserDTO userDTO) {
//        if (userRepository.existsByEmail(userDTO.getEmail())) {
//            throw new RuntimeException("Email already exists");
//        }
//        // we make users without decode the passwords
//        User user = User.builder()
//                .email(userDTO.getEmail())
//                .name(userDTO.getName())
//                .password(userDTO.getPassword())
//                .build();
//        // inbox trash ..............
//        Factory.createDefaultFolders(user);
//
//        return userRepository.save(user);
//    }
//    // login first
//    public User login(String email, String password) {
//        User user = userRepository.findByEmail(email)
//                .orElseThrow(() -> new RuntimeException("Invalid credentials"));
//
//        if (!user.getPassword().equals(password)) {
//            throw new RuntimeException("Invalid credentials");
//        }
//
//        return user;
//    }
//
//
//
//    public User getUserById(String userId) {
//        return userRepository.findById(userId)
//                .orElseThrow(() -> new RuntimeException("User not found"));
//    }
//
//    public User getUserByEmail(String email) {
//        return userRepository.findByEmail(email)
//                .orElseThrow(() -> new RuntimeException("User not found"));
//    }
//
//
//    // this also we not need as we not has admin
//    // public List<User> getAllUsers() {
//    //     return userRepository.findAll();
//    // }
//
//
//    // Transactional mean this method make it compact if there is any error happend return the db in orginal before enter the method
//    // and make open session to db to avoid lazy fetch
//    // use in methods which make change in db and those changes make combact
//    // we not need this but can make it as bounus to make user change its data
//    @Transactional
//    public User updateUser(String userId, UserDTO userDTO) {
//        User user = getUserById(userId);
//        user.setName(userDTO.getName());
//        return userRepository.save(user);
//    }
//    // this also we not need it as we not have admin make delete or ban to users i cancel it
//    // @Transactional
//    // public void deleteUser(String userId) {
//    //     userRepository.deleteById(userId);
//    // }
//}
// UserService.java
package com.email_server.backend.Services;

import com.email_server.backend.Dto.UserDTO;
import com.email_server.backend.Entities.User;
import com.email_server.backend.Repositories.UserRepository;
import com.email_server.backend.patterns.Factory;
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
        Factory.createDefaultFolders(user);

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