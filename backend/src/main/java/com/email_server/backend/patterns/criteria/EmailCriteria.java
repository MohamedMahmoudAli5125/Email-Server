// com/email_server/backend/patterns/criteria/EmailCriteria.java
package com.email_server.backend.patterns.criteria;

import com.email_server.backend.Entities.Contact;
import java.util.List;
import java.util.stream.Collectors;

public class EmailCriteria implements ContactCriteria {
    private final String email;

    public EmailCriteria(String email) {
        this.email = email == null ? "" : email.toLowerCase().trim();
    }

    @Override
    public List<Contact> meetCriteria(List<Contact> contacts) {
        if (email.isEmpty()) {
            return contacts;
        }

        return contacts.stream()
                .filter(contact ->
                        contact.getEmailAddresses().stream()
                                .anyMatch(contactEmail ->
                                        contactEmail.toLowerCase().contains(email)))
                .collect(Collectors.toList());
    }
}