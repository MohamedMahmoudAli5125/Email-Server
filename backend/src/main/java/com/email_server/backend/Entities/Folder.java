package com.email_server.backend.Entities;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.email_server.backend.enums.FolderType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "folders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Folder {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FolderType type;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    // CHANGED: Many-to-Many relationship with emails
    @ManyToMany(mappedBy = "folders", fetch = FetchType.LAZY)
    @JsonIgnore
    @Builder.Default
    private List<Email> emails = new ArrayList<>();

    // Helper methods
    public void addEmail(Email email) {
        emails.add(email);
        email.getFolders().add(this);
    }

    public void removeEmail(Email email) {
        emails.remove(email);
        email.getFolders().remove(this);
    }
}