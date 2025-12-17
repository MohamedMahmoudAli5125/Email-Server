// com/email_server/backend/patterns/criteria/SortByEmailCountCriteria.java
package com.email_server.backend.patterns.criteria;

import com.email_server.backend.Entities.Contact;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

public class SortByEmailCountCriteria implements ContactCriteria {
    private final boolean ascending;

    public SortByEmailCountCriteria(boolean ascending) {
        this.ascending = ascending;
    }

    @Override
    public List<Contact> meetCriteria(List<Contact> contacts) {
        Comparator<Contact> comparator = Comparator.comparingInt(
                contact -> contact.getEmailAddresses().size());

        if (!ascending) {
            comparator = comparator.reversed();
        }

        return contacts.stream()
                .sorted(comparator)
                .collect(Collectors.toList());
    }
}