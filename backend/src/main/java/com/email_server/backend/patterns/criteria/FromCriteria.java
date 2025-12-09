package com.email_server.backend.patterns.criteria;

import com.email_server.backend.Entities.Email;
import com.email_server.backend.patterns.criteria.Criteria;

import java.util.List;
import java.util.stream.Collectors;

public class FromCriteria implements Criteria {
    private String from;

    public FromCriteria(String from) {
        this.from = from != null ? from.toLowerCase() : "";
    }

    @Override
    public List<Email> meetCriteria(List<Email> emails) {
        return emails.stream()
                .filter(email -> email.getFromEmail() != null &&
                        email.getFromEmail().toLowerCase().contains(from))
                .collect(Collectors.toList());
    }
}
