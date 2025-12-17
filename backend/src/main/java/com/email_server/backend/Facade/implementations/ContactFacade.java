package com.email_server.backend.Facade.implementations;
import com.email_server.backend.Dto.ContactDTO;
import com.email_server.backend.Entities.Contact;
import com.email_server.backend.Facade.interfaces.IContactFacade;
import com.email_server.backend.Services.ContactService;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class ContactFacade implements IContactFacade {

    private final ContactService contactService;

    public ContactFacade(ContactService contactService) {
        this.contactService = contactService;
    }

    @Override
    public List<Contact> getUserContacts(String userId) {
        return contactService.getUserContacts(userId);
    }

    @Override
    public Contact getContactById(String contactId) {
        return contactService.getContactById(contactId);
    }

    @Override
    @Transactional
    public Contact createContact(String userId, ContactDTO contactDTO) {
        return contactService.createContact(userId, contactDTO);
    }

    @Override
    @Transactional
    public Contact updateContact(String contactId, ContactDTO contactDTO) {
        return contactService.updateContact(contactId, contactDTO);
    }

    @Override
    @Transactional
    public void deleteContact(String contactId) {
        contactService.deleteContact(contactId);
    }

    @Override
    public Map<String, Object> checkEmailInContacts(String userId, String email) {
        boolean exists = contactService.emailExistsInUserContacts(userId, email);
        Contact contact = contactService.findContactByEmail(userId, email);

        Map<String, Object> result = new HashMap<>();
        result.put("existsInContacts", exists);

        if (contact != null) {
            Map<String, String> contactInfo = new HashMap<>();
            contactInfo.put("id", contact.getId());
            contactInfo.put("name", contact.getName());
            result.put("contact", contactInfo);
        } else {
            result.put("contact", null);
        }

        return result;
    }
    @Override
    public List<Contact> searchContacts(String userId, Map<String, String> searchParams) {
        return contactService.searchContacts(userId, searchParams);
    }

    @Override
    public List<Contact> getFilteredContacts(String userId, String search, String sortBy, String order) {
        return contactService.getFilteredContacts(userId, search, sortBy, order);
    }

    @Override
    public List<String> getContactNames(String userId, String prefix) {
        return contactService.getContactNames(userId, prefix);
    }

    @Override
    public List<String> getContactEmails(String userId, String prefix) {
        return contactService.getContactEmails(userId, prefix);
    }
}