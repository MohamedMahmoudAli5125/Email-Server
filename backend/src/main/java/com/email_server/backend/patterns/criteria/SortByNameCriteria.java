// com/email_server/backend/patterns/criteria/SortByNameCriteria.java
package com.email_server.backend.patterns.criteria;

import com.email_server.backend.Entities.Contact;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

public class SortByNameCriteria implements ContactCriteria {
    private final boolean ascending;

    public SortByNameCriteria(boolean ascending) {
        this.ascending = ascending;
    }

    @Override
    public List<Contact> meetCriteria(List<Contact> contacts) {
        Comparator<Contact> comparator = Comparator.comparing(Contact::getName,
                String.CASE_INSENSITIVE_ORDER);

        if (!ascending) {
            comparator = comparator.reversed();
        }

        return contacts.stream()
                .sorted(comparator)
                .collect(Collectors.toList());
    }
}