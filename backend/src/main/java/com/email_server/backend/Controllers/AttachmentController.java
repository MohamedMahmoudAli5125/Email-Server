package com.email_server.backend.Controllers;

import com.email_server.backend.Entities.Attachment;
import com.email_server.backend.Services.AttachmentService;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/emails")
@CrossOrigin(origins = "http://localhost:4200")
public class AttachmentController {

    private final AttachmentService attachmentService;

    public AttachmentController(AttachmentService attachmentService) {
        this.attachmentService = attachmentService;
    }

    @GetMapping("/{emailId}/attachments/{attachmentId}/download")
    public ResponseEntity<Resource> downloadAttachment(
            @PathVariable String emailId,
            @PathVariable String attachmentId) {

        try {
            // Get the attachment metadata
            Attachment attachment = attachmentService.getAttachment(attachmentId);

            // Verify attachment belongs to the email (security check)
            if (!attachment.getEmail().getId().equals(emailId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            // Get the file bytes
            byte[] fileData = attachmentService.getAttachmentFile(attachmentId);

            // Create resource from byte array
            ByteArrayResource resource = new ByteArrayResource(fileData);

            // Determine content type
            String contentType = attachment.getFileType();
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            // Build response with headers
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + attachment.getFileName() + "\"")
                    .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(fileData.length))
                    .body(resource);

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping("/{emailId}/attachments/{attachmentId}/preview")
    public ResponseEntity<Resource> previewAttachment(
            @PathVariable String emailId,
            @PathVariable String attachmentId) {

        try {
            // Get the attachment metadata
            Attachment attachment = attachmentService.getAttachment(attachmentId);

            // Verify attachment belongs to the email (security check)
            if (!attachment.getEmail().getId().equals(emailId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            // Get the file bytes
            byte[] fileData = attachmentService.getAttachmentFile(attachmentId);

            // Create resource from byte array
            ByteArrayResource resource = new ByteArrayResource(fileData);

            // Determine content type
            String contentType = attachment.getFileType();
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            // Build response with inline disposition for preview
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "inline; filename=\"" + attachment.getFileName() + "\"")
                    .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(fileData.length))
                    .body(resource);

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }


    @GetMapping("/{emailId}/attachments")
    public ResponseEntity<List<Attachment>> getEmailAttachments(@PathVariable String emailId) {
        try {
            List<Attachment> attachments = attachmentService.getEmailAttachments(emailId);
            return ResponseEntity.ok(attachments);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping("/{emailId}/attachments/{attachmentId}")
    public ResponseEntity<Attachment> getAttachmentMetadata(
            @PathVariable String emailId,
            @PathVariable String attachmentId) {

        try {
            Attachment attachment = attachmentService.getAttachment(attachmentId);

            // Verify attachment belongs to the email
            if (!attachment.getEmail().getId().equals(emailId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            return ResponseEntity.ok(attachment);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @DeleteMapping("/{emailId}/attachments/{attachmentId}")
    public ResponseEntity<Void> deleteAttachment(
            @PathVariable String emailId,
            @PathVariable String attachmentId) {

        try {
            Attachment attachment = attachmentService.getAttachment(attachmentId);

            // Verify attachment belongs to the email
            if (!attachment.getEmail().getId().equals(emailId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            // Additional check: only allow deletion for drafts
            if (!attachment.getEmail().isDraft()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .header("X-Error-Message", "Only draft attachments can be deleted")
                        .build();
            }

            attachmentService.deleteAttachment(attachmentId);
            return ResponseEntity.noContent().build();

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * Download multiple attachments as a zip (bonus feature)
     * GET /api/emails/{emailId}/attachments/download-all
     */
    @GetMapping("/{emailId}/attachments/download-all")
    public ResponseEntity<Resource> downloadAllAttachments(@PathVariable String emailId) {
        try {
            // Get all attachments for the email
            List<Attachment> attachments = attachmentService.getEmailAttachments(emailId);

            if (attachments.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .header("X-Error-Message", "No attachments found")
                        .build();
            }

            // If only one attachment, download it directly
//            if (attachments.size() == 1) {
//                Attachment attachment = attachments.get(0);
//                byte[] fileData = attachmentService.getAttachmentFile(attachment.getId());
//                ByteArrayResource resource = new ByteArrayResource(fileData);
//
//                return ResponseEntity.ok()
//                        .contentType(MediaType.parseMediaType(attachment.getFileType()))
//                        .header(HttpHeaders.CONTENT_DISPOSITION,
//                                "attachment; filename=\"" + attachment.getFileName() + "\"")
//                        .body(resource);
//            }

            // For multiple attachments, create a ZIP file
            byte[] zipData = attachmentService.createZipOfAttachments(emailId);
            ByteArrayResource resource = new ByteArrayResource(zipData);

            String zipFilename = "attachments_" + emailId.substring(0, 8) + ".zip";

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType("application/zip"))
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + zipFilename + "\"")
                    .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(zipData.length))
                    .body(resource);

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .header("X-Error-Message", e.getMessage())
                    .build();
        }
    }
}