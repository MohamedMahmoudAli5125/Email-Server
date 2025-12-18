package com.email_server.backend.Facade.interfaces;

import com.email_server.backend.Dto.EmailDTO;
import com.email_server.backend.Dto.EmailFilterDTO;
import com.email_server.backend.Entities.Email;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

public interface IEmailFacade {

    ResponseEntity<?> sendEmail(String userId, EmailDTO emailDTO);

    ResponseEntity<?> saveDraft(String userId, EmailDTO emailDTO);

    ResponseEntity<?> updateDraft(String draftId, EmailDTO emailDTO);

    ResponseEntity<Page<Email>> getFolderEmails(String folderId, int page, int size);

    ResponseEntity<?> getEmailById(String emailId);

    ResponseEntity<Email> markAsRead(String emailId);

    ResponseEntity<Email> markAsUnread(String emailId);

    ResponseEntity<Email> toggleImportant(String emailId);

    ResponseEntity<?> moveEmail(String emailId, String targetFolderId);

    ResponseEntity<?> moveEmails(Map<String, Object> request);

    ResponseEntity<?> deleteEmail(String emailId, String userId);

    ResponseEntity<?> deletePermanently(String emailId);

    ResponseEntity<?> deleteMultipleEmails(Map<String, Object> request);

    ResponseEntity<Map<String, Long>> getUnreadCount(String folderId);

    ResponseEntity<List<Email>> searchEmailsWithCriteria(
            String folderId, String keyword, int page, int size,
            String sortBy, String sortDirection);

    ResponseEntity<List<Email>> filterEmailsWithCriteria(
            String folderId, EmailFilterDTO filterDTO);

    ResponseEntity<List<Email>> searchAndFilterWithCriteria(
            String folderId, EmailFilterDTO filterDTO);

    ResponseEntity<?> addEmailToFolder(String folderId, EmailDTO emailDTO);
}