// AuthController.java
package com.email_server.backend.Controllers;

import com.email_server.backend.Dto.UserDTO;
import com.email_server.backend.Entities.User;
import com.email_server.backend.services.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody UserDTO userDTO, BindingResult result) {
        // Bean Validation errors from DTO annotations
        if (result.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            result.getFieldErrors().forEach(error ->
                    errors.put(error.getField(), error.getDefaultMessage()));
            return ResponseEntity.badRequest().body(errors);
        }

        try {
            User user = userService.signup(userDTO);
            // Return only necessary fields
            Map<String, Object> response = new HashMap<>();
            response.put("id", user.getId());
            response.put("email", user.getEmail());
            response.put("name", user.getName());
            response.put("message", "User registered successfully");

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        try {
            String email = credentials.get("email");
            String password = credentials.get("password");

            if (email == null || password == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Email and password are required"));
            }

            User user = userService.login(email, password);

            // Return user info without password
            Map<String, Object> response = new HashMap<>();
            response.put("id", user.getId());
            response.put("email", user.getEmail());
            response.put("name", user.getName());
            response.put("message", "Login successful");

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", e.getMessage()));
        }
    }
    // Add these 3 endpoints to your existing AuthController.java

    // 1. GET Profile
    @GetMapping("/profile/{userId}")
    public ResponseEntity<?> getProfile(@PathVariable String userId) {
        try {
            User user = userService.getUserById(userId);

            Map<String, Object> response = new HashMap<>();
            response.put("id", user.getId());
            response.put("email", user.getEmail());
            response.put("name", user.getName());
            response.put("message", "Profile retrieved successfully");

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // 2. UPDATE Profile
    @PutMapping("/profile/{userId}")
    public ResponseEntity<?> updateProfile(
            @PathVariable String userId,
            @RequestBody Map<String, String> updateData) {  // Using Map for flexibility

        try {
            // Create a UserDTO from the update data
            UserDTO updateDTO = new UserDTO();

            // Only set fields that are provided (partial update)
            if (updateData.containsKey("name")) {
                updateDTO.setName(updateData.get("name"));
            }
            if (updateData.containsKey("password")) {
                updateDTO.setPassword(updateData.get("password"));
            }
            // Email cannot be updated, so ignore if provided

            User user = userService.updateUser(userId, updateDTO);

            Map<String, Object> response = new HashMap<>();
            response.put("id", user.getId());
            response.put("email", user.getEmail());
            response.put("name", user.getName());
            response.put("message", "Profile updated successfully");

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // 3. DELETE Profile
    @DeleteMapping("/profile/{userId}")
    public ResponseEntity<?> deleteAccount(@PathVariable String userId) {
        try {
            userService.deleteUser(userId);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Account deleted successfully"
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}