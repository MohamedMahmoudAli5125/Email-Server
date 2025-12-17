package com.email_server.backend.Repositories;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.email_server.backend.Entities.Email;
import com.email_server.backend.enums.EmailPriority;

@Repository
public interface EmailRepository extends JpaRepository<Email, String> {

    @Query("SELECT e FROM Email e LEFT JOIN FETCH e.attachments WHERE e.id = :emailId")
    Optional<Email> findByIdWithAttachments(@Param("emailId") String emailId);

    // CHANGED: Query emails in a specific folder, excluding deleted ones
    @Query("SELECT e FROM Email e JOIN e.folders f WHERE f.id = :folderId AND e.isDeleted = false")
    Page<Email> findByFolderId(@Param("folderId") String folderId, Pageable pageable);

    // Get all emails in a folder (including deleted)
    @Query("SELECT e FROM Email e JOIN e.folders f WHERE f.id = :folderId")
    Page<Email> findByFolderIdIncludingDeleted(@Param("folderId") String folderId, Pageable pageable);

    // For trash folder - get deleted emails
    @Query("SELECT e FROM Email e JOIN e.folders f WHERE f.id = :folderId AND e.isDeleted = true")
    Page<Email> findDeletedByFolderId(@Param("folderId") String folderId, Pageable pageable);

    // Unread emails in folder (excluding deleted)
    @Query("SELECT e FROM Email e JOIN e.folders f WHERE f.id = :folderId AND e.isDeleted = false AND e.isRead = false")
    Page<Email> findByFolderIdAndIsReadFalse(@Param("folderId") String folderId, Pageable pageable);

    // Important emails in folder (excluding deleted)
    @Query("SELECT e FROM Email e JOIN e.folders f WHERE f.id = :folderId AND e.isDeleted = false AND e.isImportant = true")
    Page<Email> findByFolderIdAndIsImportantTrue(@Param("folderId") String folderId, Pageable pageable);

    // Draft emails in folder (excluding deleted)
    @Query("SELECT e FROM Email e JOIN e.folders f WHERE f.id = :folderId AND e.isDeleted = false AND e.isDraft = true")
    Page<Email> findByFolderIdAndIsDraftTrue(@Param("folderId") String folderId, Pageable pageable);

    // Search by sender (excluding deleted)
    @Query("SELECT e FROM Email e JOIN e.folders f WHERE f.id = :folderId AND e.isDeleted = false AND LOWER(e.fromEmail) LIKE LOWER(CONCAT('%', :sender, '%'))")
    Page<Email> searchBySender(@Param("folderId") String folderId, @Param("sender") String sender, Pageable pageable);

    // Search by body (excluding deleted)
    @Query("SELECT e FROM Email e JOIN e.folders f WHERE f.id = :folderId AND e.isDeleted = false AND LOWER(e.body) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Email> searchByBody(@Param("folderId") String folderId, @Param("keyword") String keyword, Pageable pageable);

    // Search by attachment (excluding deleted)
    @Query("SELECT DISTINCT e FROM Email e JOIN e.folders f JOIN e.attachments a WHERE f.id = :folderId AND e.isDeleted = false AND LOWER(a.fileName) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Email> searchByAttachment(@Param("folderId") String folderId, @Param("keyword") String keyword, Pageable pageable);

    // Search all fields (excluding deleted)
    @Query("SELECT DISTINCT e FROM Email e JOIN e.folders f LEFT JOIN e.attachments a WHERE f.id = :folderId AND e.isDeleted = false AND " +
            "(LOWER(e.body) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(e.subject) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(e.fromEmail) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(a.fileName) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Email> searchByAll(@Param("folderId") String folderId, @Param("keyword") String keyword, Pageable pageable);

    // Find by priority (excluding deleted)
    @Query("SELECT e FROM Email e JOIN e.folders f WHERE f.id = :folderId AND e.isDeleted = false AND e.priority = :priority")
    Page<Email> findByFolderIdAndPriority(@Param("folderId") String folderId, @Param("priority") EmailPriority priority, Pageable pageable);

    // Find emails with attachments (excluding deleted)
    @Query("SELECT DISTINCT e FROM Email e JOIN e.folders f WHERE f.id = :folderId AND e.isDeleted = false AND SIZE(e.attachments) > 0")
    Page<Email> findEmailsWithAttachments(@Param("folderId") String folderId, Pageable pageable);

    // Delete old emails from trash
    @Query("DELETE FROM Email e WHERE e.isDeleted = true AND e.sentDate < :cutoffDate")
    void deleteOldTrashEmails(@Param("cutoffDate") LocalDateTime cutoffDate);

    // Count unread emails in folder (excluding deleted)
    @Query("SELECT COUNT(e) FROM Email e JOIN e.folders f WHERE f.id = :folderId AND e.isDeleted = false AND e.isRead = false")
    long countByFolderIdAndIsReadFalse(@Param("folderId") String folderId);

    // Check if email is in specific folder
    @Query("SELECT CASE WHEN COUNT(e) > 0 THEN true ELSE false END FROM Email e JOIN e.folders f WHERE e.id = :emailId AND f.id = :folderId")
    boolean isEmailInFolder(@Param("emailId") String emailId, @Param("folderId") String folderId);

// EmailRepository.java

    @Query("SELECT e FROM Email e JOIN e.folders f WHERE f.id = :folderId AND e.isDeleted = false " +
            "ORDER BY CASE e.priority " +
            "WHEN 'URGENT' THEN 4 " +
            "WHEN 'HIGH' THEN 3 " +
            "WHEN 'NORMAL' THEN 2 " +
            "WHEN 'LOW' THEN 1 " +
            "END DESC, e.sentDate DESC")
    Page<Email> findByFolderIdSortedByPriority(@Param("folderId") String folderId, Pageable pageable);

    @Query("SELECT e FROM Email e JOIN e.folders f WHERE f.id = :folderId AND e.isDeleted = true " +
            "ORDER BY CASE e.priority " +
            "WHEN 'URGENT' THEN 4 " +
            "WHEN 'HIGH' THEN 3 " +
            "WHEN 'NORMAL' THEN 2 " +
            "WHEN 'LOW' THEN 1 " +
            "END DESC, e.sentDate DESC")
    Page<Email> findDeletedByFolderIdSortedByPriority(@Param("folderId") String folderId, Pageable pageable);

}