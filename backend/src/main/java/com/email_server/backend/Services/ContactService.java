package com.email_server.backend.services;

import java.util.List;

import com.email_server.backend.Dto.ContactDTO;
import com.email_server.backend.Entities.Contact;
import com.email_server.backend.Entities.User;
import com.email_server.backend.Repositories.ContactRepository;
import com.email_server.backend.Services.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


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
        
        contact.setName(contactDTO.getName());
        contact.setEmailAddresses(contactDTO.getEmailAddresses());
        
        return contactRepository.save(contact);
    }
    
    @Transactional
    public void deleteContact(String contactId) {
        contactRepository.deleteById(contactId);
    }
}
