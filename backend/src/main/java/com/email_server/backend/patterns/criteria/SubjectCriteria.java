
package com.email_server.backend.patterns.criteria;

import com.email_server.backend.Entities.Email;
import com.email_server.backend.enums.EmailPriority;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

// Filter by Subject
public class SubjectCriteria implements Criteria {
    private String subject;

    public SubjectCriteria(String subject) {
        this.subject = subject != null ? subject.toLowerCase() : "";
    }

    @Override
    public List<Email> meetCriteria(List<Email> emails) {
        return emails.stream()
                .filter(email -> email.getSubject() != null &&
                        email.getSubject().toLowerCase().contains(subject))
                .collect(Collectors.toList());
    }
}