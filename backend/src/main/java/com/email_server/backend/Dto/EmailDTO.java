package com.email_server.backend.Dto;

import com.email_server.backend.enums.EmailPriority;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailDTO {
    private String fromEmail;
    private List<String> to;
    private List<String> cc;
    private List<String> bcc;
    private String subject;
    private String body;
    private EmailPriority priority;
    private List<MultipartFile> attachmentFiles;

    // NEW: For handling existing attachments when sending drafts
    private String existingAttachmentIds; // Comma-separated IDs
}