package com.email_server.backend.Dto;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UserDTO {
    // not blank mean not empty "", "  spaces  " and not null 
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;
    
    @NotBlank(message = "Name is required")
    private String name;
    
    @NotBlank(message = "Password is required")
    private String password;
}