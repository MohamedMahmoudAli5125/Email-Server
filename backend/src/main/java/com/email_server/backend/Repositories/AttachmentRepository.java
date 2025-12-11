package com.email_server.backend.Repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.email_server.backend.Entities.Attachment;

@Repository
public interface AttachmentRepository extends JpaRepository<  Attachment,String> {
    List<Attachment> findByEmailId(String emailId);
}
