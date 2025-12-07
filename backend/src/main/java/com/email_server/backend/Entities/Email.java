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
    @Index(name = "idx_priority", columnList = "priority")
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
    
    // @ElementCollection
    // @CollectionTable(name = "email_cc", joinColumns = @JoinColumn(name = "email_id"))
    // @Column(name = "cc_recipient")
    // @Builder.Default
    // private List<String> ccList = new ArrayList<>();
    
    // @ElementCollection
    // @CollectionTable(name = "email_bcc", joinColumns = @JoinColumn(name = "email_id"))
    // @Column(name = "bcc_recipient")
    // @Builder.Default
    // private List<String> bccList = new ArrayList<>();
    
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
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "folder_id")
    @JsonIgnore
    private Folder folder;
    
    @OneToMany(mappedBy = "email", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Attachment> attachments = new ArrayList<>();
    
    // Helper methods
    public void addAttachment(Attachment attachment) {
        attachments.add(attachment);
        attachment.setEmail(this);
    }
    
    public void removeAttachment(Attachment attachment) {
        attachments.remove(attachment);
        attachment.setEmail(null);
    }
}