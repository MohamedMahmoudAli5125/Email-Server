package com.email_server.backend.Controllers;

// we not handle any sort  ans strategy this sort not notice for what
// we not handle get by priority just date 
// we not handle any filter for search
// we not handle any singlton like i want 

import java.util.List;
import java.util.Map;

import com.email_server.backend.Dto.EmailDTO;
import com.email_server.backend.Dto.EmailFilterDTO;
import com.email_server.backend.Entities.Email;
import com.email_server.backend.Services.EmailService;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;


import jakarta.validation.Valid;

@RestController
@CrossOrigin("*")
@RequestMapping("/api/emails")

    public class    EmailController {
    
    private final EmailService emailService;
    
    public EmailController(EmailService emailService) {
        this.emailService = emailService;
    }
    
    // Send Email
    // need form data
    // ModelAttribute this to data form to give me attachments 
    @PostMapping("/send")
    public ResponseEntity<?> sendEmail(@RequestParam String userId,
                                      @ModelAttribute EmailDTO emailDTO) {
        try {
            Email email = emailService.sendEmail(userId, emailDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(email);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Save Draft
    @PostMapping("/draft")
    public ResponseEntity<?> saveDraft(@RequestParam String userId,
                                     @ModelAttribute EmailDTO emailDTO) {
        try {
            Email draft = emailService.saveDraft(userId, emailDTO);
            System.out.println("drafted");
            return ResponseEntity.status(HttpStatus.CREATED).body(draft);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Update Draft
    @PutMapping("/draft/{draftId}")
    public ResponseEntity<?> updateDraft(@PathVariable String draftId,
                                         @ModelAttribute EmailDTO emailDTO) {
        try {
            Email draft = emailService.updateDraft(draftId, emailDTO);
            return ResponseEntity.ok(draft);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Get emails of folder according to folder id notice i return page as this required to make pagable
    @GetMapping("/folder/{folderId}")
    public ResponseEntity<Page<Email>> getFolderEmails(
            @PathVariable String folderId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<Email> emails = emailService.getFolderEmails(folderId, page, size);
        return ResponseEntity.ok(emails);
    }



    
    // Get Email by ID when press on one 
    @GetMapping("/{emailId}")
    public ResponseEntity<?> getEmailById(@PathVariable String emailId) {
        try {
            Email email = emailService.getEmailById(emailId);
            return ResponseEntity.ok(email);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    // Mark as Read bonus
    @PutMapping("/{emailId}/read")
    public ResponseEntity<Email> markAsRead(@PathVariable String emailId) {
        Email email = emailService.markAsRead(emailId);
        return ResponseEntity.ok(email);
    }
    
    // Mark as Unread bonus
    @PutMapping("/{emailId}/unread")
    public ResponseEntity<Email> markAsUnread(@PathVariable String emailId) {
        Email email = emailService.markAsUnread(emailId);
        return ResponseEntity.ok(email);
    }
    
    // Toggle Important  this we need it to sort 
    @PutMapping("/{emailId}/important")
    public ResponseEntity<Email> toggleImportant(@PathVariable String emailId) {
        Email email = emailService.toggleImportant(emailId);
        return ResponseEntity.ok(email);
    }
    
    // Move Email to Folder 
    @PutMapping("/{emailId}/move")
    public ResponseEntity<?> moveEmail(@PathVariable String emailId,
                                      @RequestParam String targetFolderId) {
        try {
            emailService.moveEmail(emailId, targetFolderId);
            return ResponseEntity.ok(Map.of("message", "Email moved successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Bulk Move Emails
    @PutMapping("/bulk/move")
    public ResponseEntity<?> moveEmails(@RequestBody Map<String, Object> request) {
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
    
    // Delete Email (Move to Trash)
    @DeleteMapping("/{emailId}")
    public ResponseEntity<?> deleteEmail(@PathVariable String emailId,
                                        @RequestParam String userId) {
        try {
            emailService.deleteEmail(emailId, userId);
            return ResponseEntity.ok(Map.of("message", "Email moved to trash"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Delete Permanently from trash
    @DeleteMapping("/{emailId}/permanent")
    public ResponseEntity<?> deletePermanently(@PathVariable String emailId) {
        try {
            emailService.deletePermanently(emailId);
            return ResponseEntity.ok(Map.of("message", "Email deleted permanently"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Bulk Delete move to trash
    @DeleteMapping("/bulk")
    public ResponseEntity<?> deleteMultipleEmails(@RequestBody Map<String, Object> request) {
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
    
    // Get Unread Count to put it in most left bonus
    @GetMapping("/folder/{folderId}/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@PathVariable String folderId) {
        long count = emailService.getUnreadCount(folderId);
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    // Search , Filter end points and a temp way to add (any emails bodies (without any validation stages) for testing purposes
//serch (from , to , subject , filename(need some fixes) and body
    @GetMapping("/folder/{folderId}/search-criteria")
    public ResponseEntity<List<Email>> searchEmailsWithCriteria(
            @PathVariable String folderId,
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "sentDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {
        List<Email> emails = emailService.searchEmailsWithCriteria(
                folderId, keyword, page, size, sortBy, sortDirection
        );
        return ResponseEntity.ok(emails);
    }
    // filter with most fields and a date range(start - end)
    @PostMapping("/folder/{folderId}/filter-criteria")
    public ResponseEntity<List<Email>> filterEmailsWithCriteria(
            @PathVariable String folderId,
            @RequestBody EmailFilterDTO filterDTO) {
        List<Email> emails = emailService.filterEmailsWithCriteria(folderId, filterDTO);
        return ResponseEntity.ok(emails);
    }
    // search and filter combined ( i guess it has no importance for now )
    @PostMapping("/folder/{folderId}/search-filter-criteria")
    public ResponseEntity<List<Email>> searchAndFilterWithCriteria(
            @PathVariable String folderId,
            @RequestBody EmailFilterDTO filterDTO) {
        List<Email> emails = emailService.searchAndFilterWithCriteria(folderId, filterDTO);
        return ResponseEntity.ok(emails);
    }

    //add emails to folder by folderid(without validators) , just for testing)
    @PostMapping("/folder/{folderId}/add")
    public ResponseEntity<?> addEmailToFolder(
            @PathVariable String folderId,
            @ModelAttribute EmailDTO emailDTO) {
        try {
            // Create email directly in the specified folder
            Email email = emailService.addEmailToFolder(folderId, emailDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(email);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
