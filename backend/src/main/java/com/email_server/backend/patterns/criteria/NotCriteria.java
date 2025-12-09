package com.email_server.backend.patterns.criteria;

import com.email_server.backend.Entities.Email;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class NotCriteria implements Criteria {
        private Criteria criteria;

        public NotCriteria(Criteria criteria) {
            this.criteria = criteria;
        }

        @Override
        public List<Email> meetCriteria(List<Email> emails) {
            List<Email> criteriaEmails = criteria.meetCriteria(emails);

            return emails.stream()
                    .filter(email -> !criteriaEmails.contains(email))
                    .collect(Collectors.toList());
        }

}
