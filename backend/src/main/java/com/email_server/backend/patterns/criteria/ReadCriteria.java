package com.email_server.backend.patterns.criteria;

import com.email_server.backend.Entities.Email;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class ReadCriteria implements Criteria {
        private boolean isRead;

        public ReadCriteria(boolean isRead) {
            this.isRead = isRead;
        }

        @Override
        public List<Email> meetCriteria(List<Email> emails) {
            return emails.stream()
                    .filter(email -> email.isRead() == isRead)
                    .collect(Collectors.toList());

    }
}
