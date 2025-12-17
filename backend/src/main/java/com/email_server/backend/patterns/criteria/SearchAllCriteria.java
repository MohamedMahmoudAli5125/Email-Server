// com/email_server/backend/patterns/criteria/SearchAllCriteria.java
package com.email_server.backend.patterns.criteria;

import com.email_server.backend.Entities.Contact;
import java.util.List;
import java.util.stream.Collectors;

public class SearchAllCriteria implements ContactCriteria {
    private final String keyword;

    public SearchAllCriteria(String keyword) {
        this.keyword = keyword == null ? "" : keyword.toLowerCase().trim();
    }

    @Override
    public List<Contact> meetCriteria(List<Contact> contacts) {
        if (keyword.isEmpty()) {
            return contacts;
        }

        return contacts.stream()
                .filter(contact ->
                        contact.getName().toLowerCase().contains(keyword) ||
                                contact.getEmailAddresses().stream()
                                        .anyMatch(email -> email.toLowerCase().contains(keyword)))
                .collect(Collectors.toList());
    }
}