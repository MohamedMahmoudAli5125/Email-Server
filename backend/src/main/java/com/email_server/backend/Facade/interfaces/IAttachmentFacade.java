package com.email_server.backend.Facade.interfaces;

import com.email_server.backend.Entities.Attachment;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface IAttachmentFacade {

    ResponseEntity<Resource> downloadAttachment(String emailId, String attachmentId);

    ResponseEntity<Resource> previewAttachment(String emailId, String attachmentId);

    ResponseEntity<List<Attachment>> getEmailAttachments(String emailId);

    ResponseEntity<Attachment> getAttachmentMetadata(String emailId, String attachmentId);

    ResponseEntity<Void> deleteAttachment(String emailId, String attachmentId);

    ResponseEntity<Resource> downloadAllAttachments(String emailId);
}