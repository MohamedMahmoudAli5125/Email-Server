package com.email_server.backend.patterns.criteria;

import com.email_server.backend.Entities.Email;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class AttachmentFileNameCriteria implements Criteria {
    // Filter by Attachment File Name
        private String fileName;

        public AttachmentFileNameCriteria(String fileName) {
            this.fileName = fileName != null ? fileName.toLowerCase() : "";
        }

        @Override
        public List<Email> meetCriteria(List<Email> emails) {
            return emails.stream()
                    .filter(email -> email.getAttachments() != null &&
                            email.getAttachments().stream()
                                    .anyMatch(att -> att.getFileName() != null &&
                                            att.getFileName().toLowerCase().contains(fileName)))
                    .collect(Collectors.toList());
        }

}
