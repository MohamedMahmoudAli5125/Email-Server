package com.email_server.backend.patterns.criteria;

import com.email_server.backend.Entities.Email;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class HasAttachmentsCriteria implements Criteria {
        private boolean hasAttachments;

        public HasAttachmentsCriteria(boolean hasAttachments) {
            this.hasAttachments = hasAttachments;
        }

        @Override
        public List<Email> meetCriteria(List<Email> emails) {
            return emails.stream()
                    .filter(email -> {
                        boolean emailHasAttachments = email.getAttachments() != null &&
                                !email.getAttachments().isEmpty();
                        return emailHasAttachments == hasAttachments;
                    })
                    .collect(Collectors.toList());
        }

}
