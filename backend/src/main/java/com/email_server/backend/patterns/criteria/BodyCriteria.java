package com.email_server.backend.patterns.criteria;

import com.email_server.backend.Entities.Email;
import com.email_server.backend.patterns.criteria.Criteria;

import java.util.List;
import java.util.stream.Collectors;

public class BodyCriteria implements Criteria {
    private String bodyKeyword;

    public BodyCriteria(String bodyKeyword) {
        this.bodyKeyword = bodyKeyword != null ? bodyKeyword.toLowerCase() : "";
    }

    @Override
    public List<Email> meetCriteria(List<Email> emails) {
        return emails.stream()
                .filter(email -> email.getBody() != null &&
                        email.getBody().toLowerCase().contains(bodyKeyword))
                .collect(Collectors.toList());
    }
}