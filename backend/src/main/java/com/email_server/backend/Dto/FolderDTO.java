package com.email_server.backend.Dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class FolderDTO {
    
    @NotBlank(message = "Folder name is required")
    private String name;
}