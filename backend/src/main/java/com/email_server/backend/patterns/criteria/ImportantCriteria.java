package com.email_server.backend.patterns.criteria;

import com.email_server.backend.Entities.Email;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class ImportantCriteria implements Criteria {
        private boolean isImportant;

        public ImportantCriteria(boolean isImportant) {
            this.isImportant = isImportant;
        }

        @Override
        public List<Email> meetCriteria(List<Email> emails) {
            return emails.stream()
                    .filter(email -> email.isImportant() == isImportant)
                    .collect(Collectors.toList());
    }
}
