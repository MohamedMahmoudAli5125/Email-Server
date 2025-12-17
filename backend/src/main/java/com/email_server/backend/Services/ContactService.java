package com.email_server.backend.Services;

import java.util.*;
import java.util.stream.Collectors;

import com.email_server.backend.Dto.ContactDTO;
import com.email_server.backend.Entities.Contact;
import com.email_server.backend.Entities.User;
import com.email_server.backend.Repositories.ContactRepository;
import com.email_server.backend.Services.UserService;
import com.email_server.backend.patterns.criteria.ContactCriteriaFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.email_server.backend.patterns.criteria.ContactCriteria;
import com.email_server.backend.patterns.criteria.CriteriaFactory;


@Service
public class ContactService {

    private final ContactRepository contactRepository;
    private final UserService userService;

    public ContactService(ContactRepository contactRepository, UserService userService) {
        this.contactRepository = contactRepository;
        this.userService = userService;
    }
    // to get contacts
    public List<Contact> getUserContacts(String userId) {
        return contactRepository.findByUserId(userId);
    }


    public Contact getContactById(String contactId) {
        return contactRepository.findById(contactId)
                .orElseThrow(() -> new RuntimeException("Contact not found"));
    }

    @Transactional
    public Contact createContact(String userId, ContactDTO contactDTO) {
        User user = userService.getUserById(userId);
        List<String> processedEmails = validateAndProcessEmails(userId, null, contactDTO.getEmailAddresses());


        Contact contact = Contact.builder()
                .name(contactDTO.getName())
                .emailAddresses(contactDTO.getEmailAddresses())
                .user(user)
                .build();

        return contactRepository.save(contact);
    }

    @Transactional
    public Contact updateContact(String contactId, ContactDTO contactDTO) {
        Contact contact = getContactById(contactId);
        List<String> processedEmails = validateAndProcessEmails(
                contact.getUser().getId(),
                contactId,
                contactDTO.getEmailAddresses()
        );
        contact.setName(contactDTO.getName());
        contact.setEmailAddresses(contactDTO.getEmailAddresses());

        return contactRepository.save(contact);
    }

    @Transactional
    public void deleteContact(String contactId) {
        contactRepository.deleteById(contactId);
    }
    private List<String> validateAndProcessEmails(String userId, String currentContactId, List<String> emails) {
        if (emails == null || emails.isEmpty()) {
            throw new RuntimeException("At least one email address is required");
        }

        // Step 1: Process emails - trim and convert to lowercase
        List<String> processedEmails = emails.stream()
                .map(email -> {
                    if (email == null || email.trim().isEmpty()) {
                        throw new RuntimeException("Email address cannot be empty");
                    }
                    return email.trim().toLowerCase();
                })
                .collect(Collectors.toList());

        // Step 2: Check for duplicates within the same contact
        Set<String> uniqueEmails = new HashSet<>();
        Set<String> duplicateEmails = new HashSet<>();

        for (String email : processedEmails) {
            if (!uniqueEmails.add(email)) {
                duplicateEmails.add(email);
            }
        }

        if (!duplicateEmails.isEmpty()) {
            throw new RuntimeException(
                    "Duplicate email addresses found within the same contact: " +
                            String.join(", ", duplicateEmails)
            );
        }
        User currentUser = userService.getUserById(userId);
        String userEmail = currentUser.getEmail().toLowerCase();
        for (String email : processedEmails) {
            if (email.equals(userEmail)) {
                throw new RuntimeException(
                        "You cannot add your own email address as a contact"
                );
            }
        }
        // Step 3: Check if emails already exist in other contacts for the same user
        // This is allowed: emails can be any address, even if no user has it
        // We only prevent duplicate emails across the user's own contacts


        List<Contact> userContacts = contactRepository.findByUserId(userId);

        for (Contact contact : userContacts) {
            // Skip the current contact if we're updating
            if (currentContactId != null && contact.getId().equals(currentContactId)) {
                continue;
            }

            for (String contactEmail : contact.getEmailAddresses()) {
                if (processedEmails.contains(contactEmail.toLowerCase())) {
                    throw new RuntimeException(
                            String.format("Email '%s' already exists in your contact '%s'",
                                    contactEmail, contact.getName())
                    );
                }
            }
        }

        return processedEmails;
    }

    public boolean emailExistsInUserContacts(String userId, String email) {
        List<Contact> userContacts = contactRepository.findByUserId(userId);
        String emailToCheck = email.trim().toLowerCase();

        for (Contact contact : userContacts) {
            for (String contactEmail : contact.getEmailAddresses()) {
                if (contactEmail.toLowerCase().equals(emailToCheck)) {
                    return true;
                }
            }
        }

        return false;
    }

    public Contact findContactByEmail(String userId, String email) {
        List<Contact> userContacts = contactRepository.findByUserId(userId);
        String emailToFind = email.trim().toLowerCase();

        for (Contact contact : userContacts) {
            for (String contactEmail : contact.getEmailAddresses()) {
                if (contactEmail.toLowerCase().equals(emailToFind)) {
                    return contact;
                }
            }
        }

        return null;
    }

        public List<Contact> searchContacts(String userId, Map<String, String> searchParams) {
            List<Contact> contacts = getUserContacts(userId);

            if (searchParams == null || searchParams.isEmpty()) {
                return contacts;
            }

            ContactCriteria criteria = null;

            // Search by name
            if (searchParams.containsKey("name")) {
                criteria = ContactCriteriaFactory.createNameCriteria(searchParams.get("name"));
            }

            // Search by email
            if (searchParams.containsKey("email")) {
                ContactCriteria emailCriteria = ContactCriteriaFactory.createEmailCriteria(searchParams.get("email"));
                if (criteria == null) {
                    criteria = emailCriteria;
                } else {
                    // Combine with AND logic
                    criteria = ContactCriteriaFactory.createAndCriteria(criteria, emailCriteria);
                }
            }

            // Search all (name or email)
            if (searchParams.containsKey("search")) {
                criteria = ContactCriteriaFactory.createSearchAllCriteria(searchParams.get("search"));
            }

            // Apply sorting
            if (searchParams.containsKey("sortBy")) {
                String sortBy = searchParams.get("sortBy");
                boolean ascending = !"desc".equals(searchParams.getOrDefault("order", "asc"));

                ContactCriteria sortCriteria = null;
                switch (sortBy.toLowerCase()) {
                    case "name":
                        sortCriteria = ContactCriteriaFactory.createSortByNameCriteria(ascending);
                        break;
                    case "emailcount":
                    case "email_count":
                        sortCriteria = ContactCriteriaFactory.createSortByEmailCountCriteria(ascending);
                        break;
                }

                if (sortCriteria != null) {
                    if (criteria == null) {
                        criteria = sortCriteria;
                    } else {
                        // Apply search first, then sort
                        List<Contact> filtered = criteria.meetCriteria(contacts);
                        return sortCriteria.meetCriteria(filtered);
                    }
                }
            }

            return criteria != null ? criteria.meetCriteria(contacts) : contacts;
        }

        /**
         * Get filtered and sorted contacts
         */
        public List<Contact> getFilteredContacts(String userId, String search, String sortBy, String order) {
            Map<String, String> params = new HashMap<>();

            if (search != null && !search.trim().isEmpty()) {
                params.put("search", search);
            }

            if (sortBy != null && !sortBy.trim().isEmpty()) {
                params.put("sortBy", sortBy);
                params.put("order", order != null ? order : "asc");
            }

            return searchContacts(userId, params);
        }

        /**
         * Get distinct contact names for autocomplete
         */
        public List<String> getContactNames(String userId, String prefix) {
            List<Contact> contacts = getUserContacts(userId);

            return contacts.stream()
                    .map(Contact::getName)
                    .filter(name -> prefix == null || prefix.isEmpty() ||
                            name.toLowerCase().contains(prefix.toLowerCase()))
                    .distinct()
                    .collect(Collectors.toList());
        }

        /**
         * Get distinct email addresses for autocomplete
         */
        public List<String> getContactEmails(String userId, String prefix) {
            List<Contact> contacts = getUserContacts(userId);

            return contacts.stream()
                    .flatMap(contact -> contact.getEmailAddresses().stream())
                    .filter(email -> prefix == null || prefix.isEmpty() ||
                            email.toLowerCase().contains(prefix.toLowerCase()))
                    .distinct()
                    .collect(Collectors.toList());
        }
    }
