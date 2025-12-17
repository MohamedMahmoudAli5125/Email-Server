package com.email_server.backend.Facade.interfaces;
import com.email_server.backend.Dto.ContactDTO;
import com.email_server.backend.Entities.Contact;
import java.util.List;
import java.util.Map;

public interface IContactFacade {

    List<Contact> getUserContacts(String userId);

    Contact getContactById(String contactId);

    Contact createContact(String userId, ContactDTO contactDTO);

    Contact updateContact(String contactId, ContactDTO contactDTO);

    void deleteContact(String contactId);

    Map<String, Object> checkEmailInContacts(String userId, String email);
    List<Contact> searchContacts(String userId, Map<String, String> searchParams);

    List<Contact> getFilteredContacts(String userId, String search, String sortBy, String order);

    List<String> getContactNames(String userId, String prefix);

    List<String> getContactEmails(String userId, String prefix);
}