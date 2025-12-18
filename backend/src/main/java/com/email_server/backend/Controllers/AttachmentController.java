package com.email_server.backend.Controllers;
import com.email_server.backend.Facade.interfaces.IAttachmentFacade;
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

    //    private final AttachmentService attachmentService;
    private final IAttachmentFacade attachmentFacade; // Changed from AttachmentService

    // CHANGE CONSTRUCTOR ONLY:
    public AttachmentController(IAttachmentFacade attachmentFacade) { // Changed parameter type
        this.attachmentFacade = attachmentFacade; // Changed assignment
    }

//    public AttachmentController(AttachmentService attachmentService) {
//        this.attachmentService = attachmentService;
//    }

    @GetMapping("/{emailId}/attachments/{attachmentId}/download")
    public ResponseEntity<Resource> downloadAttachment(
            @PathVariable String emailId,
            @PathVariable String attachmentId) {

//        try {
//            Attachment attachment = attachmentService.getAttachment(attachmentId);
//
//            // CHANGED: Check if attachment belongs to this email (Many-to-One)
//            if (attachment.getEmail() == null || !attachment.getEmail().getId().equals(emailId)) {
//                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
//            }
//
//            byte[] fileData = attachmentService.getAttachmentFile(attachmentId);
//            ByteArrayResource resource = new ByteArrayResource(fileData);
//
//            String contentType = attachment.getFileType();
//            if (contentType == null) {
//                contentType = "application/octet-stream";
//            }
//
//            return ResponseEntity.ok()
//                    .contentType(MediaType.parseMediaType(contentType))
//                    .header(HttpHeaders.CONTENT_DISPOSITION,
//                            "attachment; filename=\"" + attachment.getFileName() + "\"")
//                    .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(fileData.length))
//                    .body(resource);
//
//        } catch (RuntimeException e) {
//            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
//        }
        return attachmentFacade.downloadAttachment(emailId, attachmentId);

    }

    @GetMapping("/{emailId}/attachments/{attachmentId}/preview")
    public ResponseEntity<Resource> previewAttachment(
            @PathVariable String emailId,
            @PathVariable String attachmentId) {
//
//        try {
//            Attachment attachment = attachmentService.getAttachment(attachmentId);
//
//            // CHANGED: Check if attachment belongs to this email (Many-to-One)
//            if (attachment.getEmail() == null || !attachment.getEmail().getId().equals(emailId)) {
//                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
//            }
//
//            byte[] fileData = attachmentService.getAttachmentFile(attachmentId);
//            ByteArrayResource resource = new ByteArrayResource(fileData);
//
//            String contentType = attachment.getFileType();
//            if (contentType == null) {
//                contentType = "application/octet-stream";
//            }
//
//            return ResponseEntity.ok()
//                    .contentType(MediaType.parseMediaType(contentType))
//                    .header(HttpHeaders.CONTENT_DISPOSITION,
//                            "inline; filename=\"" + attachment.getFileName() + "\"")
//                    .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(fileData.length))
//                    .body(resource);
//
//        } catch (RuntimeException e) {
//            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
//        }
        return attachmentFacade.previewAttachment(emailId, attachmentId);

    }

    @GetMapping("/{emailId}/attachments")
    public ResponseEntity<List<Attachment>> getEmailAttachments(@PathVariable String emailId) {
        try {
//            List<Attachment> attachments = attachmentService.getEmailAttachments(emailId);
            List<Attachment> attachments = attachmentFacade.getEmailAttachments(emailId).getBody();

            return ResponseEntity.ok(attachments);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping("/{emailId}/attachments/{attachmentId}")
    public ResponseEntity<Attachment> getAttachmentMetadata(
            @PathVariable String emailId,
            @PathVariable String attachmentId) {

//        try {
//            Attachment attachment = attachmentService.getAttachment(attachmentId);
//
//            // CHANGED: Check if attachment belongs to this email (Many-to-One)
//            if (attachment.getEmail() == null || !attachment.getEmail().getId().equals(emailId)) {
//                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
//            }
//
//            return ResponseEntity.ok(attachment);
//        } catch (RuntimeException e) {
//            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
//        }
        return attachmentFacade.getAttachmentMetadata(emailId, attachmentId);

    }

    @DeleteMapping("/{emailId}/attachments/{attachmentId}")
    public ResponseEntity<Void> deleteAttachment(
            @PathVariable String emailId,
            @PathVariable String attachmentId) {

//        try {
//            Attachment attachment = attachmentService.getAttachment(attachmentId);
//
//            // CHANGED: Check if attachment belongs to this email (Many-to-One)
//            if (attachment.getEmail() == null || !attachment.getEmail().getId().equals(emailId)) {
//                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
//            }
//
//            // Check if the email is a draft
//            if (attachment.getEmail() != null && !attachment.getEmail().isDraft()) {
//                return ResponseEntity.status(HttpStatus.FORBIDDEN)
//                        .header("X-Error-Message", "Cannot delete attachment - email is not a draft")
//                        .build();
//            }
//
//            attachmentService.deleteAttachment(attachmentId);
//            return ResponseEntity.noContent().build();
//
//        } catch (RuntimeException e) {
//            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
//        }
        return attachmentFacade.deleteAttachment(emailId, attachmentId);

    }

    @GetMapping("/{emailId}/attachments/download-all")
    public ResponseEntity<Resource> downloadAllAttachments(@PathVariable String emailId) {
//        try {
//            List<Attachment> attachments = attachmentService.getEmailAttachments(emailId);
//
//            if (attachments.isEmpty()) {
//                return ResponseEntity.status(HttpStatus.NOT_FOUND)
//                        .header("X-Error-Message", "No attachments found")
//                        .build();
//            }
//
//            byte[] zipData = attachmentService.createZipOfAttachments(emailId);
//            ByteArrayResource resource = new ByteArrayResource(zipData);
//
//            String zipFilename = "attachments_" + emailId.substring(0, 8) + ".zip";
//
//            return ResponseEntity.ok()
//                    .contentType(MediaType.parseMediaType("application/zip"))
//                    .header(HttpHeaders.CONTENT_DISPOSITION,
//                            "attachment; filename=\"" + zipFilename + "\"")
//                    .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(zipData.length))
//                    .body(resource);
//
//        } catch (RuntimeException e) {
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                    .header("X-Error-Message", e.getMessage())
//                    .build();
//        }
//    }
        return attachmentFacade.downloadAllAttachments(emailId);

    }
}