package com.email_server.backend.Facade.interfaces;

import com.email_server.backend.Dto.EmailDTO;
import com.email_server.backend.Dto.EmailFilterDTO;
import com.email_server.backend.Entities.Email;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;

public interface IEmailFacade {

    ResponseEntity<Email> saveDraft(
            String userId, String fromEmail, String to, String cc, String bcc,
            String subject, String body, String priority,
            List<org.springframework.web.multipart.MultipartFile> attachmentFiles,
            String existingAttachmentIds);

    ResponseEntity<?> sendDraft(String userId, EmailDTO emailDTO, String draftId);

    ResponseEntity<?> updateDraft(String draftId, EmailDTO emailDTO);

    ResponseEntity<Email> sendEmail(
            String userId, String fromEmail, String to, String cc, String bcc,
            String subject, String body, String priority,
            List<org.springframework.web.multipart.MultipartFile> attachmentFiles,
            String existingAttachmentIds);

    ResponseEntity<Page<Email>> getFolderEmails(String folderId, int page, int size);

    ResponseEntity<?> getEmailById(String emailId);

    ResponseEntity<Email> markAsRead(String emailId);

    ResponseEntity<Email> markAsUnread(String emailId);

    ResponseEntity<Email> toggleImportant(String emailId);

    ResponseEntity<?> moveEmail(String emailId, String targetFolderId);

    ResponseEntity<?> removeFromFolder(String emailId, String folderId);

    ResponseEntity<?> moveEmails(Map<String, Object> request);

    ResponseEntity<?> deleteEmail(String emailId, String userId);

    ResponseEntity<?> restoreFromTrash(String emailId, String userId);

    ResponseEntity<?> deletePermanently(String emailId);

    ResponseEntity<?> deleteMultipleEmails(Map<String, Object> request);

    ResponseEntity<?> deleteMultipleEmailsPermanently(Map<String, Object> request);

    ResponseEntity<Map<String, Long>> getUnreadCount(String folderId);

    ResponseEntity<List<Email>> searchEmailsWithCriteria(
            String folderId, String keyword, int page, int size,
            String sortBy, String sortDirection);

    ResponseEntity<List<Email>> filterEmailsWithCriteria(
            String folderId, EmailFilterDTO filterDTO);

    ResponseEntity<List<Email>> searchAndFilterWithCriteria(
            String folderId, EmailFilterDTO filterDTO);

    ResponseEntity<?> addEmailToFolder(String folderId, EmailDTO emailDTO);

    ResponseEntity<Page<Email>> getFolderEmailsSortedByPriority(
            String folderId, int page, int size);
}