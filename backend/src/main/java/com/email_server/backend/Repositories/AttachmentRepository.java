package com.email_server.backend.Repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.email_server.backend.Entities.Attachment;
import java.util.List;

public interface AttachmentRepository extends JpaRepository<  Attachment,String> {
    List<Attachment> findByEmailId(String emailId);
}
