// com/email_server/backend/patterns/criteria/ContactCriteriaFactory.java
package com.email_server.backend.patterns.criteria;

import com.email_server.backend.Entities.Contact;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

public class ContactCriteriaFactory {

    // Search criteria
    public static ContactCriteria createNameCriteria(String name) {
        return new NameCriteria(name);
    }

    public static ContactCriteria createEmailCriteria(String email) {
        return new EmailCriteria(email);
    }

    public static ContactCriteria createSearchAllCriteria(String keyword) {
        return new SearchAllCriteria(keyword);
    }

    // Sorting criteria
    public static ContactCriteria createSortByNameCriteria(boolean ascending) {
        return new SortByNameCriteria(ascending);
    }

    public static ContactCriteria createSortByEmailCountCriteria(boolean ascending) {
        return new SortByEmailCountCriteria(ascending);
    }

    // Combinators
    public static ContactCriteria createAndCriteria(ContactCriteria criteria1, ContactCriteria criteria2) {
        return contacts -> {
            List<Contact> firstFilter = criteria1.meetCriteria(contacts);
            return criteria2.meetCriteria(firstFilter);
        };
    }

    public static ContactCriteria createOrCriteria(ContactCriteria criteria1, ContactCriteria criteria2) {
        return contacts -> {
            List<Contact> firstResult = criteria1.meetCriteria(contacts);
            List<Contact> secondResult = criteria2.meetCriteria(contacts);

            return firstResult.stream()
                    .filter(contact -> !secondResult.contains(contact))
                    .collect(Collectors.toList());
        };
    }
}