//changes should be made in attach controller
//import com.email_server.backend.Facade.interfaces.IAttachmentFacade; // Add this import
// private final IAttachmentFacade attachmentFacade; // Changed from AttachmentService
//  public AttachmentController(IAttachmentFacade attachmentFacade) { // Changed parameter type
//        this.attachmentFacade = attachmentFacade; // Changed assignment
//    }
//            return attachmentFacade.downloadAttachment(emailId, attachmentId); // Changed call
//            return attachmentFacade.previewAttachment(emailId, attachmentId); // Changed call
 //            List<Attachment> attachments = attachmentFacade.getEmailAttachments(emailId).getBody(); // Changed call
 //            return attachmentFacade.getAttachmentMetadata(emailId, attachmentId); // Changed call
 //            return attachmentFacade.deleteAttachment(emailId, attachmentId); // Changed call
//            return attachmentFacade.downloadAllAttachments(emailId); // Changed call
package com.email_server.backend.Facade.implementations;

import com.email_server.backend.Entities.Attachment;
import com.email_server.backend.Facade.interfaces.IAttachmentFacade;
import com.email_server.backend.Services.AttachmentService;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class AttachmentFacade implements IAttachmentFacade {

    private final AttachmentService attachmentService;

    public AttachmentFacade(AttachmentService attachmentService) {
        this.attachmentService = attachmentService;
    }

    @Override
    public ResponseEntity<Resource> downloadAttachment(String emailId, String attachmentId) {
        try {
            Attachment attachment = attachmentService.getAttachment(attachmentId);

            // Check if attachment belongs to this email (Many-to-One)
            if (attachment.getEmail() == null || !attachment.getEmail().getId().equals(emailId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            byte[] fileData = attachmentService.getAttachmentFile(attachmentId);
            ByteArrayResource resource = new ByteArrayResource(fileData);

            String contentType = attachment.getFileType();
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

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

    @Override
    public ResponseEntity<Resource> previewAttachment(String emailId, String attachmentId) {
        try {
            Attachment attachment = attachmentService.getAttachment(attachmentId);

            // Check if attachment belongs to this email (Many-to-One)
            if (attachment.getEmail() == null || !attachment.getEmail().getId().equals(emailId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            byte[] fileData = attachmentService.getAttachmentFile(attachmentId);
            ByteArrayResource resource = new ByteArrayResource(fileData);

            String contentType = attachment.getFileType();
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

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

    @Override
    public ResponseEntity<List<Attachment>> getEmailAttachments(String emailId) {
        try {
            List<Attachment> attachments = attachmentService.getEmailAttachments(emailId);
            return ResponseEntity.ok(attachments);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @Override
    public ResponseEntity<Attachment> getAttachmentMetadata(String emailId, String attachmentId) {
        try {
            Attachment attachment = attachmentService.getAttachment(attachmentId);

            // Check if attachment belongs to this email (Many-to-One)
            if (attachment.getEmail() == null || !attachment.getEmail().getId().equals(emailId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            return ResponseEntity.ok(attachment);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @Override
    public ResponseEntity<Void> deleteAttachment(String emailId, String attachmentId) {
        try {
            Attachment attachment = attachmentService.getAttachment(attachmentId);

            // Check if attachment belongs to this email (Many-to-One)
            if (attachment.getEmail() == null || !attachment.getEmail().getId().equals(emailId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            // Check if the email is a draft
            if (attachment.getEmail() != null && !attachment.getEmail().isDraft()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .header("X-Error-Message", "Cannot delete attachment - email is not a draft")
                        .build();
            }

            attachmentService.deleteAttachment(attachmentId);
            return ResponseEntity.noContent().build();

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @Override
    public ResponseEntity<Resource> downloadAllAttachments(String emailId) {
        try {
            List<Attachment> attachments = attachmentService.getEmailAttachments(emailId);

            if (attachments.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .header("X-Error-Message", "No attachments found")
                        .build();
            }

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