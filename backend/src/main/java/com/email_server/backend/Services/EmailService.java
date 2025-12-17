package com.email_server.backend.Services;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.Queue;

import com.email_server.backend.Dto.EmailFilterDTO;
import com.email_server.backend.Repositories.FolderRepository;
import com.email_server.backend.patterns.EmailQueueManager;
import com.email_server.backend.patterns.criteria.Criteria;
import com.email_server.backend.patterns.criteria.CriteriaFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.email_server.backend.Dto.EmailDTO;
import com.email_server.backend.Entities.Attachment;
import com.email_server.backend.Entities.Email;
import com.email_server.backend.Entities.Folder;
import com.email_server.backend.Entities.User;
import com.email_server.backend.Repositories.EmailRepository;
import com.email_server.backend.Repositories.UserRepository;
import com.email_server.backend.enums.EmailPriority;
import com.email_server.backend.enums.FolderType;
import org.springframework.web.multipart.MultipartFile;

@Service
public class EmailService {

    private final EmailRepository emailRepository;
    private final FolderService folderService;
    private final UserRepository userRepository;
    private final AttachmentService attachmentService;
    private final EmailQueueManager queueManager;
    private final EmailFilterService emailFilterService;
    private final FolderRepository folderRepository;

    public EmailService(EmailRepository emailRepository,
                        FolderService folderService,
                        AttachmentService attachmentService,
                        UserRepository userRepository,
                        EmailFilterService emailFilterService,
                        FolderRepository folderRepository) {
        this.emailRepository = emailRepository;
        this.folderService = folderService;
        this.attachmentService = attachmentService;
        this.userRepository = userRepository;
        this.queueManager = EmailQueueManager.getInstance();
        this.emailFilterService = emailFilterService;
        this.folderRepository = folderRepository;
    }

    @Transactional
    public Email sendEmail(String userId, EmailDTO emailDTO) {
        User sender = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));

        // Build email
        Email email = Email.builder()
                .fromEmail(emailDTO.getFromEmail())
                .toList(emailDTO.getTo())
                .subject(emailDTO.getSubject())
                .body(emailDTO.getBody())
                .priority(emailDTO.getPriority() )
                .sentDate(LocalDateTime.now())
                .isDeleted(false)
                .build();

        // Save email first (needed for attachments)
        Email savedEmail = emailRepository.save(email);

        // Add to sender's SENT folder
        Folder sentFolder = folderService.getUserFolderByType(userId, FolderType.SENT);
        savedEmail.addFolder(sentFolder);

        // Save attachments with the email
        if (emailDTO.getAttachmentFiles() != null && !emailDTO.getAttachmentFiles().isEmpty()) {
            List<Attachment> attachments = attachmentService.saveAttachments(
                    emailDTO.getAttachmentFiles(),
                    savedEmail
            );
            savedEmail.getAttachments().addAll(attachments);
        }

        savedEmail = emailRepository.save(savedEmail);

        // Queue for delivery to recipients
        queueManager.enqueue(savedEmail);
        processEmailQueue(savedEmail);

        return savedEmail;
    }


    private void processEmailQueue(Email email) {
        Email queuedEmail = queueManager.dequeue();

        Queue<String> allRecipients = new LinkedList<>();
        allRecipients.addAll(queuedEmail.getToList());

        while (!allRecipients.isEmpty()) {
            String recipientEmail = allRecipients.poll();
            deliverEmailToRecipient(queuedEmail, recipientEmail);
        }
    }

    @Transactional
    private void deliverEmailToRecipient(Email originalEmail, String recipientEmail) {
        userRepository.findByEmail(recipientEmail).ifPresent(recipient -> {
            // Create copy for recipient
            Email recipientEmailCopy = copyEmail(originalEmail);
            recipientEmailCopy.setRead(false);
            recipientEmailCopy.setDeleted(false);

            // Save the copied email first
            Email savedCopy = emailRepository.save(recipientEmailCopy);

            // Add to recipient's INBOX folder
            Folder inboxFolder = folderService.getUserFolderByType(recipient.getId(), FolderType.INBOX);
            savedCopy.addFolder(inboxFolder);

            emailRepository.save(savedCopy);
        });
    }

    private Email copyEmail(Email original) {
        Email copiedEmail = Email.builder()
                .fromEmail(original.getFromEmail())
                .toList(new ArrayList<>(original.getToList()))
                .subject(original.getSubject())
                .body(original.getBody())
                .priority(original.getPriority())
                .sentDate(original.getSentDate())
                .isDeleted(false)
                .build();

        // Copy attachments (create new attachment records pointing to same files)
        if (original.getAttachments() != null && !original.getAttachments().isEmpty()) {
            for (Attachment originalAttachment : original.getAttachments()) {
                Attachment copiedAttachment = Attachment.builder()
                        .fileName(originalAttachment.getFileName())
                        .fileType(originalAttachment.getFileType())
                        .filePath(originalAttachment.getFilePath())
                        .fileSize(originalAttachment.getFileSize())
                        .build();
                copiedEmail.addAttachment(copiedAttachment);
            }
        }

        return copiedEmail;
    }

    @Transactional
    public Email saveDraft(String userId, EmailDTO emailDTO) {
        Email draft = Email.builder()
                .fromEmail(emailDTO.getFromEmail())
                .toList(emailDTO.getTo())
                .subject(emailDTO.getSubject())
                .body(emailDTO.getBody())
                .priority(emailDTO.getPriority() != null ? emailDTO.getPriority() : EmailPriority.NORMAL)
                .sentDate(LocalDateTime.now())
                .isDraft(true)
                .isDeleted(false)
                .build();

        Email savedDraft = emailRepository.save(draft);

        // Add to DRAFT folder
        Folder draftFolder = folderService.getUserFolderByType(userId, FolderType.DRAFT);
        savedDraft.addFolder(draftFolder);

        // Save attachments
        if (emailDTO.getAttachmentFiles() != null && !emailDTO.getAttachmentFiles().isEmpty()) {
            List<Attachment> attachments = attachmentService.saveAttachments(
                    emailDTO.getAttachmentFiles(),
                    savedDraft
            );
            savedDraft.getAttachments().addAll(attachments);
        }

        return emailRepository.save(savedDraft);
    }

    @Transactional
    public Email updateDraft(String draftId, EmailDTO emailDTO) {
        Email draft = getEmailById(draftId);

        if (!draft.isDraft()) {
            throw new RuntimeException("Email is not a draft");
        }

        draft.setToList(emailDTO.getTo());
        draft.setSubject(emailDTO.getSubject());
        draft.setBody(emailDTO.getBody());
        draft.setPriority(emailDTO.getPriority() != null ? emailDTO.getPriority() : EmailPriority.NORMAL);

        return emailRepository.save(draft);
    }

    public Page<Email> getFolderEmails(String folderId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("sentDate").descending());

        // Check if it's trash folder
        Folder folder = folderService.getFolderById(folderId);
        if (folder.getType() == FolderType.TRASH) {
            // For trash, return only deleted emails
            return emailRepository.findDeletedByFolderId(folderId, pageable);
        } else {
            // For other folders, return non-deleted emails
            return emailRepository.findByFolderId(folderId, pageable);
        }
    }

    public Email getEmailById(String emailId) {
        return emailRepository.findById(emailId)
                .orElseThrow(() -> new RuntimeException("Email not found"));
    }

    @Transactional
    public Email markAsRead(String emailId) {
        Email email = getEmailById(emailId);
        email.setRead(true);
        return emailRepository.save(email);
    }

    @Transactional
    public Email markAsUnread(String emailId) {
        Email email = getEmailById(emailId);
        email.setRead(false);
        return emailRepository.save(email);
    }

    @Transactional
    public Email toggleImportant(String emailId) {
        Email email = getEmailById(emailId);
        email.setImportant(!email.isImportant());
        return emailRepository.save(email);
    }

    /**
     * Move email to a target folder
     * - If moving to TRASH: set isDeleted = true (soft delete)
     * - If moving from TRASH: set isDeleted = false (restore)
     * - If moving to custom folder: add folder without removing others
     */
    @Transactional
    public void moveEmail(String emailId, String targetFolderId) {
        Email email = getEmailById(emailId);
        Folder targetFolder = folderService.getFolderById(targetFolderId);

        if (targetFolder.getType() == FolderType.TRASH) {
            // Moving to trash - soft delete
            email.setDeleted(true);
            // Add to trash folder
            if (!email.getFolders().contains(targetFolder)) {
                email.addFolder(targetFolder);
            }
        } else {
            // Moving from trash or between folders
            if (email.isDeleted()) {
                // Restoring from trash
                email.setDeleted(false);                // Remove from trash folder
                Folder trashFolder = email.getFolders().stream()
                        .filter(f -> f.getType() == FolderType.TRASH)
                        .findFirst()
                        .orElse(null);
                if (trashFolder != null) {
                    email.removeFolder(trashFolder);
                }
            }
            // Add to target folder if not already there
            if (!email.getFolders().contains(targetFolder)) {
                email.addFolder(targetFolder);
            }
        }

        emailRepository.save(email);
    }

    @Transactional
    public void moveEmails(List<String> emailIds, String targetFolderId) {
        for (String emailId : emailIds) {
            moveEmail(emailId, targetFolderId);
        }
    }

    /**
     * Remove email from a custom folder
     * - Does NOT mark as deleted
     * - Only removes from the specified folder
     * - Email remains in other folders
     */
    @Transactional
    public void removeFromCustomFolder(String emailId, String folderId) {
        Email email = getEmailById(emailId);
        Folder folder = folderService.getFolderById(folderId);

        if (folder.getType() != FolderType.CUSTOM) {
            throw new RuntimeException("Can only remove from custom folders");
        }

        email.removeFolder(folder);
        emailRepository.save(email);
    }

    /**
     * Delete email (move to trash)
     * - Sets isDeleted = true
     * - Keeps email in all folders but won't show in non-trash folders
     */
    @Transactional
    public void deleteEmail(String emailId, String userId) {
        Email email = getEmailById(emailId);
        email.setDeleted(true);


        // Add to trash folder
        Folder trashFolder = folderService.getUserFolderByType(userId, FolderType.TRASH);
        if (!email.getFolders().contains(trashFolder)) {
            email.addFolder(trashFolder);
        }

        emailRepository.save(email);
    }

    /**
     * Permanently delete email
     * - Removes from database
     * - Also deletes all attachments
     */
    @Transactional
    public void deletePermanently(String emailId) {
        Email email = getEmailById(emailId);

        // Delete all attachments first
        for (Attachment attachment : new ArrayList<>(email.getAttachments())) {
            attachmentService.deleteAttachment(attachment.getId());
        }

        emailRepository.deleteById(emailId);
    }

    @Transactional
    public void deleteMultipleEmails(List<String> emailIds, String userId) {
        for (String emailId : emailIds) {
            deleteEmail(emailId, userId);
        }
    }

    @Transactional
    public void deleteMultipleEmailsPermanently(List<String> emailIds) {
        for (String emailId : emailIds) {
            deletePermanently(emailId);
        }
    }

    /**
     * Restore email from trash
     * - Sets isDeleted = false
     * - Removes from trash folder
     * - Email remains in its original folders
     */
    @Transactional
    public void restoreFromTrash(String emailId, String userId) {
        Email email = getEmailById(emailId);
        email.setDeleted(false);

        // Remove from trash folder
        Folder trashFolder = folderService.getUserFolderByType(userId, FolderType.TRASH);
        email.removeFolder(trashFolder);

        emailRepository.save(email);
    }

    public long getUnreadCount(String folderId) {
        return emailRepository.countByFolderIdAndIsReadFalse(folderId);
    }

    public List<Email> searchEmailsWithCriteria(String folderId, String keyword,
                                                int page, int size,
                                                String sortBy, String sortDirection) {
        List<Email> allEmails = emailRepository.findByFolderId(
                folderId,
                Pageable.unpaged()
        ).getContent();

        List<Email> filtered = emailFilterService.searchEmails(allEmails, keyword);
        filtered = emailFilterService.sortEmails(filtered, sortBy, sortDirection);

        return emailFilterService.paginate(filtered, page, size);
    }

    public List<Email> filterEmailsWithCriteria(String folderId, EmailFilterDTO filterDTO) {
        List<Email> allEmails = emailRepository.findByFolderId(
                folderId,
                Pageable.unpaged()
        ).getContent();

        List<Email> filtered = emailFilterService.filterEmails(allEmails, filterDTO);

        return emailFilterService.paginate(filtered, filterDTO.getPage(), filterDTO.getSize());
    }

    public List<Email> searchAndFilterWithCriteria(String folderId, EmailFilterDTO filterDTO) {
        List<Email> allEmails = emailRepository.findByFolderId(
                folderId,
                Pageable.unpaged()
        ).getContent();

        List<Email> filtered = emailFilterService.searchAndFilter(allEmails, filterDTO);

        return emailFilterService.paginate(filtered, filterDTO.getPage(), filterDTO.getSize());
    }

    public Email addEmailToFolder(String folderId, EmailDTO emailDTO) {
        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new IllegalArgumentException("Folder not found"));

        Email email = new Email();
        email.setFromEmail(emailDTO.getFromEmail());
        email.setToList(emailDTO.getTo());
        email.setSubject(emailDTO.getSubject());
        email.setBody(emailDTO.getBody());
        email.setPriority(emailDTO.getPriority());
        email.setSentDate(LocalDateTime.now());
        email.setRead(false);
        email.setImportant(false);
        email.setDeleted(false);

        Email savedEmail = emailRepository.save(email);
        savedEmail.addFolder(folder);

        if (emailDTO.getAttachmentFiles() != null && !emailDTO.getAttachmentFiles().isEmpty()) {
            List<Attachment> attachments = attachmentService.saveAttachments(
                    emailDTO.getAttachmentFiles(),
                    savedEmail
            );
            savedEmail.getAttachments().addAll(attachments);
        }

        return emailRepository.save(savedEmail);
    }
    public Page<Email> getFolderEmailsSortedByPriority(String folderId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        // Check if it's trash folder
        Folder folder = folderService.getFolderById(folderId);
        if (folder.getType() == FolderType.TRASH) {
            // For trash, return only deleted emails sorted by priority
            return emailRepository.findDeletedByFolderIdSortedByPriority(folderId, pageable);
        } else {
            // For other folders, return non-deleted emails sorted by priority
            return emailRepository.findByFolderIdSortedByPriority(folderId, pageable);
        }
    }
}