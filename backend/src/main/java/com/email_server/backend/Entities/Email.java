package com.email_server.backend.Entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.email_server.backend.enums.EmailPriority;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "emails", indexes = {
        @Index(name = "idx_sent_date", columnList = "sentDate"),
        @Index(name = "idx_priority", columnList = "priority"),
        @Index(name = "idx_deleted", columnList = "isDeleted")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Email {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String fromEmail;

    @ElementCollection
    @CollectionTable(name = "email_recipients", joinColumns = @JoinColumn(name = "email_id"))
    @Column(name = "recipient")
    @Builder.Default
    private List<String> toList = new ArrayList<>();

    @Column(nullable = false)
    private String subject;

    @Column(length = 10000)
    private String body;

    @Column(nullable = false)
    private LocalDateTime sentDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EmailPriority priority;

    @Column(nullable = false)
    @Builder.Default
    private boolean isRead = false;

    @Column(nullable = false)
    @Builder.Default
    private boolean isImportant = false;

    @Column(nullable = false)
    @Builder.Default
    private boolean isDraft = false;

    // NEW: Soft delete flag for trash functionality
    @Column(nullable = false)
    @Builder.Default
    private boolean isDeleted = false;

    // CHANGED: Many-to-Many relationship with folders
    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE}, fetch = FetchType.LAZY)
    @JoinTable(
            name = "email_folders",
            joinColumns = @JoinColumn(name = "email_id"),
            inverseJoinColumns = @JoinColumn(name = "folder_id")
    )
    @Builder.Default
    @JsonIgnore
    private List<Folder> folders = new ArrayList<>();

    // CHANGED: One-to-Many relationship with attachments
    @OneToMany(mappedBy = "email", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Attachment> attachments = new ArrayList<>();

    // Helper methods for folders
    public void addFolder(Folder folder) {
        folders.add(folder);
        folder.getEmails().add(this);
    }

    public void removeFolder(Folder folder) {
        folders.remove(folder);
        folder.getEmails().remove(this);
    }

    // Helper methods for attachments
    public void addAttachment(Attachment attachment) {
        attachments.add(attachment);
        attachment.setEmail(this);
    }

    public void removeAttachment(Attachment attachment) {
        attachments.remove(attachment);
        attachment.setEmail(null);
    }
}