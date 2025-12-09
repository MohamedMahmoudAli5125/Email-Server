package com.email_server.backend.patterns.criteria;

import com.email_server.backend.Entities.Email;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

// Filter by To (Recipients)
public class ToCriteria implements Criteria {
    private String to;

    public ToCriteria(String to) {
        this.to = to != null ? to.toLowerCase() : "";
    }

    @Override
    public List<Email> meetCriteria(List<Email> emails) {
        return emails.stream()
                .filter(email -> email.getToList() != null &&
                        email.getToList().stream()
                                .anyMatch(recipient -> recipient.toLowerCase().contains(to)))
                .collect(Collectors.toList());
    }
}