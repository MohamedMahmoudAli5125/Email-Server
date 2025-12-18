package com.email_server.backend.Controllers;
import com.email_server.backend.Facade.interfaces.IEmailFacade;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.email_server.backend.Dto.EmailDTO;
import com.email_server.backend.Dto.EmailFilterDTO;
import com.email_server.backend.Entities.Email;
import com.email_server.backend.Services.EmailService;
import com.email_server.backend.enums.EmailPriority;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@CrossOrigin("*")
@RequestMapping("/api/emails")
public class EmailController {

//    private final EmailService emailService;
//
//    public EmailController(EmailService emailService) {
//        this.emailService = emailService;
//    }
private final IEmailFacade emailFacade; // Changed from EmailService

    public EmailController(IEmailFacade emailFacade) { // Changed parameter type
        this.emailFacade = emailFacade; // Changed assignment
    }





    private List<String> parseEmailList(String emailString) {
        if (emailString == null || emailString.trim().isEmpty()) {
            return new ArrayList<>();
        }
        return Arrays.stream(emailString.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }


    // Save Draft

    @PostMapping("/draft")
    public ResponseEntity<Email> saveDraft(
            @RequestParam("userId") String userId,
            @RequestParam(value = "fromEmail") String fromEmail,
            @RequestParam(value = "to", required = false) String to,
            @RequestParam(value = "cc", required = false) String cc,
            @RequestParam(value = "bcc", required = false) String bcc,
            @RequestParam(value = "subject", required = false) String subject,
            @RequestParam(value = "body", required = false) String body,
            @RequestParam(value = "priority") String priority,
            @RequestParam(value = "attachmentFiles", required = false) List<MultipartFile> attachmentFiles,
            @RequestParam(value = "existingAttachmentIds", required = false) String existingAttachmentIds) {

//        EmailDTO emailDTO = EmailDTO.builder()
//                .fromEmail(fromEmail)
//                .to(parseEmailList(to))
//                .cc(parseEmailList(cc))
//                .bcc(parseEmailList(bcc))
//                .subject(subject)
//                .body(body)
//                .priority(EmailPriority.valueOf(priority))
//                .attachmentFiles(attachmentFiles)
//                .existingAttachmentIds(existingAttachmentIds)
//                .build();
//
//        Email draft = emailService.saveDraft(userId, emailDTO);
//        return ResponseEntity.ok(draft);
        return emailFacade.saveDraft(userId, fromEmail, to, cc, bcc, subject, body,
                priority, attachmentFiles, existingAttachmentIds);
    }

    @PostMapping("/sendDraft/{draftId}")
    public ResponseEntity<?> sendDraft(
            @RequestParam String userId,
            @ModelAttribute EmailDTO emailDTO,
            @PathVariable String draftId) {

//        try {
//            Email email = emailService.sendDraft(userId, emailDTO, draftId);
//            return ResponseEntity.status(HttpStatus.CREATED).body(email);
//        } catch (Exception e) {
//            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
//        }
        return emailFacade.sendDraft(userId, emailDTO, draftId);

    }


    // Update Draft
    @PutMapping("/draft/{draftId}")
    public ResponseEntity<?> updateDraft(
            @PathVariable String draftId,
            @ModelAttribute EmailDTO emailDTO) {
//        try {
//            Email updatedDraft = emailService.updateDraft(draftId, emailDTO);
//            return ResponseEntity.ok(updatedDraft);
//        } catch (Exception e) {
//            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
//        }
        return emailFacade.updateDraft(draftId, emailDTO);

    }

    @PostMapping("/send")
    public ResponseEntity<Email> sendEmail(
            @RequestParam("userId") String userId,
            @RequestParam(value = "fromEmail") String fromEmail,
            @RequestParam(value = "to") String to,
            @RequestParam(value = "cc", required = false) String cc,
            @RequestParam(value = "bcc", required = false) String bcc,
            @RequestParam(value = "subject", required = false) String subject,
            @RequestParam(value = "body", required = false) String body,
            @RequestParam(value = "priority") String priority,
            @RequestParam(value = "attachmentFiles", required = false) List<MultipartFile> attachmentFiles,
            @RequestParam(value = "existingAttachmentIds", required = false) String existingAttachmentIds) {

//        EmailDTO emailDTO = EmailDTO.builder()
//                .fromEmail(fromEmail)
//                .to(parseEmailList(to))
//                .cc(parseEmailList(cc))
//                .bcc(parseEmailList(bcc))
//                .subject(subject)
//                .body(body)
//                .priority(EmailPriority.valueOf(priority))
//                .attachmentFiles(attachmentFiles)
//                .existingAttachmentIds(existingAttachmentIds)
//                .build();
//
//        Email sent = emailService.sendEmail(userId, emailDTO);
//        return ResponseEntity.ok(sent);
        return emailFacade.sendEmail(userId, fromEmail, to, cc, bcc, subject, body,
                priority, attachmentFiles, existingAttachmentIds);
    }


    // Get emails of folder
    @GetMapping("/folder/{folderId}")
    public ResponseEntity<Page<Email>> getFolderEmails(
            @PathVariable String folderId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
//        Page<Email> emails = emailService.getFolderEmails(folderId, page, size);
//        return ResponseEntity.ok(emails);
        return emailFacade.getFolderEmails(folderId, page, size);

    }

    // Get Email by ID
    @GetMapping("/{emailId}")
    public ResponseEntity<?> getEmailById(@PathVariable String emailId) {
//        try {
//            Email email = emailService.getEmailById(emailId);
//            return ResponseEntity.ok(email);
//        } catch (Exception e) {
//            return ResponseEntity.notFound().build();
//        }
        return emailFacade.getEmailById(emailId);

    }

    // Mark as Read
    @PutMapping("/{emailId}/read")
    public ResponseEntity<Email> markAsRead(@PathVariable String emailId) {
//        Email email = emailService.markAsRead(emailId);
//        return ResponseEntity.ok(email);
        return emailFacade.markAsRead(emailId);

    }

    // Mark as Unread
    @PutMapping("/{emailId}/unread")
    public ResponseEntity<Email> markAsUnread(@PathVariable String emailId) {
//        Email email = emailService.markAsUnread(emailId);
//        return ResponseEntity.ok(email);
        return emailFacade.markAsUnread(emailId);

    }

    // Toggle Important
    @PutMapping("/{emailId}/important")
    public ResponseEntity<Email> toggleImportant(@PathVariable String emailId) {
//        Email email = emailService.toggleImportant(emailId);
//        return ResponseEntity.ok(email);
        return emailFacade.toggleImportant(emailId);

    }

    // Move Email to Folder
    @PutMapping("/{emailId}/move")
    public ResponseEntity<?> moveEmail(@PathVariable String emailId,
                                       @RequestParam String targetFolderId) {
//        try {
//            emailService.moveEmail(emailId, targetFolderId);
//            return ResponseEntity.ok(Map.of("message", "Email moved successfully"));
//        } catch (Exception e) {
//            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
//        }
        return emailFacade.moveEmail(emailId, targetFolderId);

    }

    // NEW: Remove email from custom folder (doesn't delete, just removes from folder)
    @DeleteMapping("/{emailId}/folder/{folderId}")
    public ResponseEntity<?> removeFromFolder(@PathVariable String emailId,
                                              @PathVariable String folderId) {
//        try {
//            emailService.removeFromCustomFolder(emailId, folderId);
//            return ResponseEntity.ok(Map.of("message", "Email removed from folder"));
//        } catch (Exception e) {
//            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
//        }
        return emailFacade.removeFromFolder(emailId, folderId);

    }

    // Bulk Move Emails
    @PutMapping("/bulk/move")
    public ResponseEntity<?> moveEmails(@RequestBody Map<String, Object> request) {
//        try {
//            @SuppressWarnings("unchecked")
//            List<String> emailIds = (List<String>) request.get("emailIds");
//            String targetFolderId = (String) request.get("targetFolderId");
//
//            emailService.moveEmails(emailIds, targetFolderId);
//            return ResponseEntity.ok(Map.of("message", "Emails moved successfully"));
//        } catch (Exception e) {
//            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
//        }
        return emailFacade.moveEmails(request);

    }

    // Delete Email (Move to Trash - soft delete)
    @DeleteMapping("/{emailId}")
    public ResponseEntity<?> deleteEmail(@PathVariable String emailId,
                                         @RequestParam String userId) {
//        try {
//            emailService.deleteEmail(emailId, userId);
//            return ResponseEntity.ok(Map.of("message", "Email moved to trash"));
//        } catch (Exception e) {
//            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
//        }
        return emailFacade.deleteEmail(emailId, userId);

    }

    // NEW: Restore from trash
    @PutMapping("/{emailId}/restore")
    public ResponseEntity<?> restoreFromTrash(@PathVariable String emailId,
                                              @RequestParam String userId) {
//        try {
//            emailService.restoreFromTrash(emailId, userId);
//            return ResponseEntity.ok(Map.of("message", "Email restored from trash"));
//        } catch (Exception e) {
//            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
//        }
        return emailFacade.restoreFromTrash(emailId, userId);

    }

    // Delete Permanently from trash
    @DeleteMapping("/{emailId}/permanent")
    public ResponseEntity<?> deletePermanently(@PathVariable String emailId) {
//        try {
//            emailService.deletePermanently(emailId);
//            return ResponseEntity.ok(Map.of("message", "Email deleted permanently"));
//        } catch (Exception e) {
//            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
//        }
        return emailFacade.deletePermanently(emailId);

    }

    // Bulk Delete (move to trash)
    @DeleteMapping("/bulk")
    public ResponseEntity<?> deleteMultipleEmails(@RequestBody Map<String, Object> request) {
//        try {
//            @SuppressWarnings("unchecked")
//            List<String> emailIds = (List<String>) request.get("emailIds");
//            String userId = (String) request.get("userId");
//
//            emailService.deleteMultipleEmails(emailIds, userId);
//            return ResponseEntity.ok(Map.of("message", "Emails deleted successfully"));
//        } catch (Exception e) {
//            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
//        }
        return emailFacade.deleteMultipleEmails(request);

    }

    // Bulk Delete Permanently
    @DeleteMapping("/bulk/permanent")
    public ResponseEntity<?> deleteMultipleEmailsPermanently(@RequestBody Map<String, Object> request) {
//        try {
//            @SuppressWarnings("unchecked")
//            List<String> emailIds = (List<String>) request.get("emailIds");
//
//            emailService.deleteMultipleEmailsPermanently(emailIds);
//            return ResponseEntity.ok(Map.of("message", "Emails deleted permanently"));
//        } catch (Exception e) {
//            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
//        }
        return emailFacade.deleteMultipleEmailsPermanently(request);

    }

    // Get Unread Count
    @GetMapping("/folder/{folderId}/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@PathVariable String folderId) {
//        long count = emailService.getUnreadCount(folderId);
//        return ResponseEntity.ok(Map.of("unreadCount", count));
        return emailFacade.getUnreadCount(folderId);

    }

    // Search
    @GetMapping("/folder/{folderId}/search-criteria")
    public ResponseEntity<List<Email>> searchEmailsWithCriteria(
            @PathVariable String folderId,
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "sentDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {
//        List<Email> emails = emailService.searchEmailsWithCriteria(
//                folderId, keyword, page, size, sortBy, sortDirection
//        );
//        return ResponseEntity.ok(emails);
        return emailFacade.searchEmailsWithCriteria(folderId, keyword, page, size, sortBy, sortDirection);

    }

    // Filter
    @PostMapping("/folder/{folderId}/filter-criteria")
    public ResponseEntity<List<Email>> filterEmailsWithCriteria(
            @PathVariable String folderId,
            @RequestBody EmailFilterDTO filterDTO) {
//        List<Email> emails = emailService.filterEmailsWithCriteria(folderId, filterDTO);
//        return ResponseEntity.ok(emails);
        return emailFacade.filterEmailsWithCriteria(folderId, filterDTO);

    }

    // Search and Filter
    @PostMapping("/folder/{folderId}/search-filter-criteria")
    public ResponseEntity<List<Email>> searchAndFilterWithCriteria(
            @PathVariable String folderId,
            @RequestBody EmailFilterDTO filterDTO) {
//        List<Email> emails = emailService.searchAndFilterWithCriteria(folderId, filterDTO);
//        return ResponseEntity.ok(emails);
        return emailFacade.searchAndFilterWithCriteria(folderId, filterDTO);

    }

    // Add email to folder (for testing)
    @PostMapping("/folder/{folderId}/add")
    public ResponseEntity<?> addEmailToFolder(
            @PathVariable String folderId,
            @ModelAttribute EmailDTO emailDTO) {
//        try {
//            Email email = emailService.addEmailToFolder(folderId, emailDTO);
//            return ResponseEntity.status(HttpStatus.CREATED).body(email);
//        } catch (Exception e) {
//            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
//        }
        return emailFacade.addEmailToFolder(folderId, emailDTO);

    }
    @GetMapping("/folder/{folderId}/sorted-by-priority")
    public ResponseEntity<Page<Email>> getFolderEmailsSortedByPriority(
            @PathVariable String folderId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
//        Page<Email> emails = emailService.getFolderEmailsSortedByPriority(folderId, page, size);
//        return ResponseEntity.ok(emails);
        return emailFacade.getFolderEmailsSortedByPriority(folderId, page, size);

    }
}