package com.email_server.backend.patterns.criteria;

import com.email_server.backend.Entities.Email;
import com.email_server.backend.enums.EmailPriority;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class PriorityCriteria implements Criteria {
        private EmailPriority priority;

        public PriorityCriteria(EmailPriority priority) {
            this.priority = priority;
        }

        @Override
        public List<Email> meetCriteria(List<Email> emails) {
            return emails.stream()
                    .filter(email -> email.getPriority() == priority)
                    .collect(Collectors.toList());
        }

}
