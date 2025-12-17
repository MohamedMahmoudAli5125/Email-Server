// com/email_server/backend/patterns/criteria/NameCriteria.java
package com.email_server.backend.patterns.criteria;

import com.email_server.backend.Entities.Contact;
import java.util.List;
import java.util.stream.Collectors;

public class NameCriteria implements ContactCriteria {
    private final String name;

    public NameCriteria(String name) {
        this.name = name == null ? "" : name.toLowerCase().trim();
    }

    @Override
    public List<Contact> meetCriteria(List<Contact> contacts) {
        if (name.isEmpty()) {
            return contacts;
        }

        return contacts.stream()
                .filter(contact -> contact.getName().toLowerCase().contains(name))
                .collect(Collectors.toList());
    }
}