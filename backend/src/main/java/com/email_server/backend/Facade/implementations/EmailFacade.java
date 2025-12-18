//import com.email_server.backend.Facade.interfaces.IEmailFacade; // Add this import
//private final IEmailFacade emailFacade; // Changed from EmailService
//// CHANGE CONSTRUCTOR:
//public EmailController(IEmailFacade emailFacade) { // Changed parameter type
//    this.emailFacade = emailFacade; // Changed assignment
//}
//return emailFacade.sendEmail(userId, emailDTO);
//        return emailFacade.saveDraft(userId, emailDTO);
//        return emailFacade.updateDraft(draftId, emailDTO);
//        return emailFacade.getFolderEmails(folderId, page, size);
//        return emailFacade.getEmailById(emailId);
//        return emailFacade.markAsRead(emailId);
//        return emailFacade.markAsUnread(emailId);
//        return emailFacade.toggleImportant(emailId);
//        return emailFacade.moveEmail(emailId, targetFolderId);
//        return emailFacade.moveEmails(request);
//        return emailFacade.deleteEmail(emailId, userId);
//        return emailFacade.deletePermanently(emailId);
//        return emailFacade.deleteMultipleEmails(request);
//        return emailFacade.getUnreadCount(folderId);
//        return emailFacade.searchEmailsWithCriteria(folderId, keyword, page, size, sortBy, sortDirection);
//        return emailFacade.filterEmailsWithCriteria(folderId, filterDTO);
//        return emailFacade.searchAndFilterWithCriteria(folderId, filterDTO);
//        return emailFacade.addEmailToFolder(folderId, emailDTO);
package com.email_server.backend.Facade.implementations;

import com.email_server.backend.Dto.EmailDTO;
import com.email_server.backend.Dto.EmailFilterDTO;
import com.email_server.backend.Entities.Email;
import com.email_server.backend.Facade.interfaces.IEmailFacade;
import com.email_server.backend.Services.EmailService;
import com.email_server.backend.enums.EmailPriority;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class EmailFacade implements IEmailFacade {

    private final EmailService emailService;

    public EmailFacade(EmailService emailService) {
        this.emailService = emailService;
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

    @Override
    @Transactional
    public ResponseEntity<Email> saveDraft(
            String userId, String fromEmail, String to, String cc, String bcc,
            String subject, String body, String priority,
            List<MultipartFile> attachmentFiles,
            String existingAttachmentIds) {

        EmailDTO emailDTO = EmailDTO.builder()
                .fromEmail(fromEmail)
                .to(parseEmailList(to))
                .cc(parseEmailList(cc))
                .bcc(parseEmailList(bcc))
                .subject(subject)
                .body(body)
                .priority(EmailPriority.valueOf(priority))
                .attachmentFiles(attachmentFiles)
                .existingAttachmentIds(existingAttachmentIds)
                .build();

        Email draft = emailService.saveDraft(userId, emailDTO);
        return ResponseEntity.ok(draft);
    }

    @Override
    @Transactional
    public ResponseEntity<?> sendDraft(String userId, EmailDTO emailDTO, String draftId) {
        try {
            Email email = emailService.sendDraft(userId, emailDTO, draftId);
            return ResponseEntity.status(HttpStatus.CREATED).body(email);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @Override
    @Transactional
    public ResponseEntity<?> updateDraft(String draftId, EmailDTO emailDTO) {
        try {
            Email updatedDraft = emailService.updateDraft(draftId, emailDTO);
            return ResponseEntity.ok(updatedDraft);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @Override
    @Transactional
    public ResponseEntity<Email> sendEmail(
            String userId, String fromEmail, String to, String cc, String bcc,
            String subject, String body, String priority,
            List<MultipartFile> attachmentFiles,
            String existingAttachmentIds) {

        EmailDTO emailDTO = EmailDTO.builder()
                .fromEmail(fromEmail)
                .to(parseEmailList(to))
                .cc(parseEmailList(cc))
                .bcc(parseEmailList(bcc))
                .subject(subject)
                .body(body)
                .priority(EmailPriority.valueOf(priority))
                .attachmentFiles(attachmentFiles)
                .existingAttachmentIds(existingAttachmentIds)
                .build();

        Email sent = emailService.sendEmail(userId, emailDTO);
        return ResponseEntity.ok(sent);
    }

    @Override
    public ResponseEntity<Page<Email>> getFolderEmails(String folderId, int page, int size) {
        Page<Email> emails = emailService.getFolderEmails(folderId, page, size);
        return ResponseEntity.ok(emails);
    }

    @Override
    public ResponseEntity<?> getEmailById(String emailId) {
        try {
            Email email = emailService.getEmailById(emailId);
            return ResponseEntity.ok(email);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Override
    @Transactional
    public ResponseEntity<Email> markAsRead(String emailId) {
        Email email = emailService.markAsRead(emailId);
        return ResponseEntity.ok(email);
    }

    @Override
    @Transactional
    public ResponseEntity<Email> markAsUnread(String emailId) {
        Email email = emailService.markAsUnread(emailId);
        return ResponseEntity.ok(email);
    }

    @Override
    @Transactional
    public ResponseEntity<Email> toggleImportant(String emailId) {
        Email email = emailService.toggleImportant(emailId);
        return ResponseEntity.ok(email);
    }

    @Override
    @Transactional
    public ResponseEntity<?> moveEmail(String emailId, String targetFolderId) {
        try {
            emailService.moveEmail(emailId, targetFolderId);
            return ResponseEntity.ok(Map.of("message", "Email moved successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @Override
    @Transactional
    public ResponseEntity<?> removeFromFolder(String emailId, String folderId) {
        try {
            emailService.removeFromCustomFolder(emailId, folderId);
            return ResponseEntity.ok(Map.of("message", "Email removed from folder"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @Override
    @Transactional
    public ResponseEntity<?> moveEmails(Map<String, Object> request) {
        try {
            @SuppressWarnings("unchecked")
            List<String> emailIds = (List<String>) request.get("emailIds");
            String targetFolderId = (String) request.get("targetFolderId");

            emailService.moveEmails(emailIds, targetFolderId);
            return ResponseEntity.ok(Map.of("message", "Emails moved successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @Override
    @Transactional
    public ResponseEntity<?> deleteEmail(String emailId, String userId) {
        try {
            emailService.deleteEmail(emailId, userId);
            return ResponseEntity.ok(Map.of("message", "Email moved to trash"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @Override
    @Transactional
    public ResponseEntity<?> restoreFromTrash(String emailId, String userId) {
        try {
            emailService.restoreFromTrash(emailId, userId);
            return ResponseEntity.ok(Map.of("message", "Email restored from trash"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @Override
    @Transactional
    public ResponseEntity<?> deletePermanently(String emailId) {
        try {
            emailService.deletePermanently(emailId);
            return ResponseEntity.ok(Map.of("message", "Email deleted permanently"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @Override
    @Transactional
    public ResponseEntity<?> deleteMultipleEmails(Map<String, Object> request) {
        try {
            @SuppressWarnings("unchecked")
            List<String> emailIds = (List<String>) request.get("emailIds");
            String userId = (String) request.get("userId");

            emailService.deleteMultipleEmails(emailIds, userId);
            return ResponseEntity.ok(Map.of("message", "Emails deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @Override
    @Transactional
    public ResponseEntity<?> deleteMultipleEmailsPermanently(Map<String, Object> request) {
        try {
            @SuppressWarnings("unchecked")
            List<String> emailIds = (List<String>) request.get("emailIds");

            emailService.deleteMultipleEmailsPermanently(emailIds);
            return ResponseEntity.ok(Map.of("message", "Emails deleted permanently"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @Override
    public ResponseEntity<Map<String, Long>> getUnreadCount(String folderId) {
        long count = emailService.getUnreadCount(folderId);
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    @Override
    public ResponseEntity<List<Email>> searchEmailsWithCriteria(
            String folderId, String keyword, int page, int size,
            String sortBy, String sortDirection) {
        List<Email> emails = emailService.searchEmailsWithCriteria(
                folderId, keyword, page, size, sortBy, sortDirection
        );
        return ResponseEntity.ok(emails);
    }

    @Override
    public ResponseEntity<List<Email>> filterEmailsWithCriteria(
            String folderId, EmailFilterDTO filterDTO) {
        List<Email> emails = emailService.filterEmailsWithCriteria(folderId, filterDTO);
        return ResponseEntity.ok(emails);
    }

    @Override
    public ResponseEntity<List<Email>> searchAndFilterWithCriteria(
            String folderId, EmailFilterDTO filterDTO) {
        List<Email> emails = emailService.searchAndFilterWithCriteria(folderId, filterDTO);
        return ResponseEntity.ok(emails);
    }

    @Override
    @Transactional
    public ResponseEntity<?> addEmailToFolder(String folderId, EmailDTO emailDTO) {
        try {
            Email email = emailService.addEmailToFolder(folderId, emailDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(email);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @Override
    public ResponseEntity<Page<Email>> getFolderEmailsSortedByPriority(
            String folderId, int page, int size) {
        Page<Email> emails = emailService.getFolderEmailsSortedByPriority(folderId, page, size);
        return ResponseEntity.ok(emails);
    }
}