package com.email_server.backend.Controllers;
import java.util.List;
import java.util.Map;

import com.email_server.backend.Dto.ContactDTO;
import com.email_server.backend.Entities.Contact;
import com.email_server.backend.Facade.interfaces.IContactFacade;
import com.email_server.backend.Services.ContactService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/contacts")
@CrossOrigin(origins = "*")
public class ContactController {
    
//    private ContactService contactService;
private final IContactFacade contactFacade;

    public ContactController(IContactFacade contactFacade) {
        this.contactFacade = contactFacade;
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Contact>> getUserContacts(@PathVariable String userId) {
//        List<Contact> contacts = contactService.getUserContacts(userId);
        List<Contact> contacts = contactFacade.getUserContacts(userId);

        System.out.println(contacts.size());
        return ResponseEntity.ok(contacts);
    }

    
    @GetMapping("/{contactId}")
    public ResponseEntity<?> getContactById(@PathVariable String contactId) {
        try {
//            Contact contact = contactService.getContactById(contactId);
            Contact contact = contactFacade.getContactById(contactId);

            return ResponseEntity.ok(contact);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    
    
    @PostMapping("/user/{userId}")
    public ResponseEntity<?> createContact(@PathVariable String userId,
                                         @RequestBody ContactDTO contactDTO) {
        try {
//            Contact contact = contactService.createContact(userId, contactDTO);
            Contact contact = contactFacade.createContact(userId, contactDTO);

            return ResponseEntity.status(HttpStatus.CREATED).body(contact);
        } catch (Exception e) {
//            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Error creating contact",
                    "message", e.getMessage()
            ));
        }
    }
    
    @PutMapping("/{contactId}")
    public ResponseEntity<?> updateContact(@PathVariable String contactId,
                                           @RequestBody ContactDTO contactDTO) {
        try {
//            Contact contact = contactService.updateContact(contactId, contactDTO);
            Contact contact = contactFacade.updateContact(contactId, contactDTO);

            return ResponseEntity.ok(contact);
        } catch (Exception e) {
//            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Error updating contact",
                    "message", e.getMessage()
            ));
        }
    }
    
    @DeleteMapping("/{contactId}")
    public ResponseEntity<?> deleteContact(@PathVariable String contactId) {
        try {
//            contactService.deleteContact(contactId);
            contactFacade.deleteContact(contactId);

            return ResponseEntity.ok(Map.of("message", "Contact deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    @GetMapping("/user/{userId}/check-email")
    public ResponseEntity<?> checkEmailInContacts(@PathVariable String userId,
                                                  @RequestParam String email) {
        try {
//            boolean exists = contactService.emailExistsInUserContacts(userId, email);
//            Contact contact = contactService.findContactByEmail(userId, email);
//
//            return ResponseEntity.ok(Map.of(
//                    "existsInContacts", exists,
//                    "contact", contact != null ? Map.of(
//                            "id", contact.getId(),
//                            "name", contact.getName()
//                    ) : null
//            ));
            Map<String, Object> result = contactFacade.checkEmailInContacts(userId, email);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }


    @GetMapping("/user/{userId}/search")
    public ResponseEntity<List<Contact>> searchContacts(
            @PathVariable String userId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false, defaultValue = "asc") String order) {

        List<Contact> contacts = contactFacade.getFilteredContacts(userId, search, sortBy, order);
        return ResponseEntity.ok(contacts);
    }

    @GetMapping("/user/{userId}/search/advanced")
    public ResponseEntity<List<Contact>> advancedSearch(
            @PathVariable String userId,
            @RequestParam Map<String, String> searchParams) {

        List<Contact> contacts = contactFacade.searchContacts(userId, searchParams);
        return ResponseEntity.ok(contacts);
    }

    @GetMapping("/user/{userId}/autocomplete/names")
    public ResponseEntity<List<String>> getContactNames(
            @PathVariable String userId,
            @RequestParam(required = false) String prefix) {

        List<String> names = contactFacade.getContactNames(userId, prefix);
        return ResponseEntity.ok(names);
    }

    @GetMapping("/user/{userId}/autocomplete/emails")
    public ResponseEntity<List<String>> getContactEmails(
            @PathVariable String userId,
            @RequestParam(required = false) String prefix) {

        List<String> emails = contactFacade.getContactEmails(userId, prefix);
        return ResponseEntity.ok(emails);
    }
}

