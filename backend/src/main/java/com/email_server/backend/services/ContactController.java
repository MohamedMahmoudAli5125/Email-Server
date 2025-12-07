package Email_server.Backend.Controller;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import Email_server.Backend.Dto.ContactDTO;
import Email_server.Backend.Entities.Contact;
import Email_server.Backend.services.ContactService;

@RestController
@RequestMapping("/api/contacts")
@CrossOrigin(origins = "*")
public class ContactController {
    
    private  ContactService contactService;
    
    public ContactController(ContactService contactService) {
        this.contactService = contactService;
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Contact>> getUserContacts(@PathVariable String userId) {
        List<Contact> contacts = contactService.getUserContacts(userId);
        return ResponseEntity.ok(contacts);
    }
    
    
    @GetMapping("/{contactId}")
    public ResponseEntity<?> getContactById(@PathVariable String contactId) {
        try {
            Contact contact = contactService.getContactById(contactId);
            return ResponseEntity.ok(contact);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    

    
    @PostMapping("/user/{userId}")
    public ResponseEntity<?> createContact(@PathVariable String userId,
                                         @RequestBody ContactDTO contactDTO) {
        try {
            Contact contact = contactService.createContact(userId, contactDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(contact);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PutMapping("/{contactId}")
    public ResponseEntity<?> updateContact(@PathVariable String contactId,
                                           @RequestBody ContactDTO contactDTO) {
        try {
            Contact contact = contactService.updateContact(contactId, contactDTO);
            return ResponseEntity.ok(contact);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @DeleteMapping("/{contactId}")
    public ResponseEntity<?> deleteContact(@PathVariable String contactId) {
        try {
            contactService.deleteContact(contactId);
            return ResponseEntity.ok(Map.of("message", "Contact deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
