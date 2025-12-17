package com.email_server.backend.Repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.email_server.backend.Entities.Attachment;

@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, String> {

    // CHANGED: Direct relationship with email
    List<Attachment> findByEmailId(String emailId);

    // Count attachments for an email
    @Query("SELECT COUNT(a) FROM Attachment a WHERE a.email.id = :emailId")
    long countByEmailId(@Param("emailId") String emailId);
}