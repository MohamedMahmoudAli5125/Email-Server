package com.email_server.backend.services;

import java.time.LocalDateTime;
import java.util.LinkedList;
import java.util.List;
import java.util.Queue;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.email_server.backend.Dto.EmailDTO;
import com.email_server.backend.Entities.Attachment;
import com.email_server.backend.Entities.Email;
import com.email_server.backend.Entities.Folder;
import com.email_server.backend.Entities.User;
import com.email_server.backend.Repositories.EmailRepository;
import com.email_server.backend.Repositories.UserRepository;
import com.email_server.backend.enums.EmailPriority;
import com.email_server.backend.enums.FolderType;




@Service
public class EmailService {


 
    private final EmailRepository emailRepository;
    private final FolderService folderService;
    private final AttachmentService attachmentService;
    private final UserRepository userRepository;
    private final EmailQueueManager queueManager;
    
    public EmailService(EmailRepository emailRepository,
                       FolderService folderService,
                       AttachmentService attachmentService,
                       UserRepository userRepository
                       
                      ) {
        this.emailRepository = emailRepository;
        this.folderService = folderService;
        this.attachmentService = attachmentService;
        this.userRepository = userRepository;
      
        this.queueManager = EmailQueueManager.getInstance();
    }



// UserId of who make send 
  @Transactional
    public Email sendEmail(String userId, EmailDTO emailDTO) {
        User sender = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        


// here must make validation those to list are exitst 
// then put in queue whihc in worker it will make enqueue and call sendEmail and put it userId ,EmailDTO 







        List<Attachment> attachments = attachmentService.saveAttachments(emailDTO.getAttachmentFiles());
        

        // Build email using Builder Pattern
        Email email = Email.builder()
                .fromEmail(emailDTO.getFrom())
                .toList(emailDTO.getTo())
                .subject(emailDTO.getSubject())
                .body(emailDTO.getBody())
                .priority(emailDTO.getPriority() != null ? emailDTO.getPriority() : EmailPriority.NORMAL)
                .sentDate(LocalDateTime.now())
                .attachments(attachments)
                .build();
        
        // Save to sender's SENT folder by get the folder of of the user by userId and Type 
        Folder sentFolder = folderService.getUserFolderByType(userId, FolderType.SENT);
        email.setFolder(sentFolder);
        // save email
        Email savedEmail = emailRepository.save(email);
        
        // Use Queue for multiple recipients (Singleton Pattern)
        queueManager.enqueue(savedEmail);
        processEmailQueue(savedEmail);
        
        return savedEmail;
    }
    
    private void processEmailQueue(Email email) {
        Email queuedEmail = queueManager.dequeue();
        
        // Send to all recipients 
Queue<String> allRecipients = new LinkedList<>();

        allRecipients.addAll(queuedEmail.getToList());
        // allRecipients.addAll(queuedEmail.getCcList());
        // allRecipients.addAll(queuedEmail.getBccList());
        
        // we want queue not list 
while(!allRecipients.isEmpty()){
    String recipientEmail=allRecipients.poll();
                deliverEmailToRecipient(queuedEmail, recipientEmail);

}


        // for (String recipientEmail : allRecipients) {
        //     deliverEmailToRecipient(queuedEmail, recipientEmail);
        // }



    }
    
    @Transactional
    private void deliverEmailToRecipient(Email originalEmail, String recipientEmail) {
        // Find recipient user
        userRepository.findByEmail(recipientEmail).ifPresent(recipient -> {
            // Create copy for recipient
            Email recipientEmail1 = copyEmail(originalEmail);
            recipientEmail1.setRead(false);
            
            // Apply filters
            // Folder targetFolder = filterService.applyFilters(recipient.getId(), recipientEmail1);
            // Folder targetFolder =new;
            // if (targetFolder == null) {
            Folder targetFolder=folderService.getUserFolderByType(recipient.getId(), FolderType.INBOX);
                
            // }
            // add to this folder the new email before save it  but according to relations will add automatic
            // targetFolder.getEmails().add(recipientEmail1);
            recipientEmail1.setFolder(targetFolder);
            emailRepository.save(recipientEmail1);
            // use of observer design pattern here by using socket be here  #################
           


        });
    }
    
    private Email copyEmail(Email original) {
        return  Email.builder()
                 .fromEmail(original.getFromEmail())
                .toList(original.getToList())
                // .cc(original.getCcList())
                // .bcc(original.getBccList())
                .subject(original.getSubject())
                .body(original.getBody())
                .priority(original.getPriority())
                .sentDate(original.getSentDate())
                .build();
    }



 @Transactional
    public Email saveDraft(String userId, EmailDTO emailDTO) {
        List<Attachment> attachments = attachmentService.saveAttachments(emailDTO.getAttachmentFiles());
        
        Email draft = Email.builder()
                .fromEmail(emailDTO.getFrom())
                .toList(emailDTO.getTo())
                // .cc(emailDTO.getCc() != null ? emailDTO.getCc() : new ArrayList<>())
                .subject(emailDTO.getSubject())
                .body(emailDTO.getBody())
                .priority(emailDTO.getPriority() != null ? emailDTO.getPriority() : EmailPriority.NORMAL)
                .sentDate(LocalDateTime.now())
                .isDraft(true)
                .attachments(attachments)
                .build();
        
        Folder draftFolder = folderService.getUserFolderByType(userId, FolderType.DRAFT);
        draft.setFolder(draftFolder);
        
        return emailRepository.save(draft);
    }
    
    @Transactional
    public Email updateDraft(String draftId, EmailDTO emailDTO) {
        Email draft = getEmailById(draftId);
        
        if (!draft.isDraft()) {
            throw new RuntimeException("Email is not a draft");
        }
        
        draft.setToList(emailDTO.getTo());
        draft.setSubject(emailDTO.getSubject());
        draft.setBody(emailDTO.getBody());
        draft.setPriority(emailDTO.getPriority() != null ? emailDTO.getPriority() : EmailPriority.NORMAL);
        
        return emailRepository.save(draft);
    }



 public Page<Email> getFolderEmails(String folderId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("sentDate").descending());
        return emailRepository.findByFolderId(folderId, pageable);
    }


// still there is one get by sort by priority 

// now what rest is this and filters validate senter present in start of send  
// and make filter of results of search by using Specification so we make Builder and Factory and filter and chainOfRensoplity for validation 
// Singlton and will add Observer as bonus  for websocket



// to get one by its id 
 public Email getEmailById(String emailId) {
        return emailRepository.findById(emailId)
                .orElseThrow(() -> new RuntimeException("Email not found"));
    }
    // bonus 
    @Transactional
    public Email markAsRead(String emailId) {
        Email email = getEmailById(emailId);
        email.setRead(true);
        return emailRepository.save(email);
    }
    
    // bonus
    @Transactional
    public Email markAsUnread(String emailId) {
        Email email = getEmailById(emailId);
        email.setRead(false);
        return emailRepository.save(email);
    }
    
    // bounus what make this is the user not sender 
    @Transactional
    public Email toggleImportant(String emailId) {
        Email email = getEmailById(emailId);
        email.setImportant(!email.isImportant());
        return emailRepository.save(email);
    }
    // move one
    @Transactional
    public void moveEmail(String emailId, String targetFolderId) {
        Email email = getEmailById(emailId);
        Folder targetFolder = folderService.getFolderById(targetFolderId);
        email.setFolder(targetFolder);
        emailRepository.save(email);
    }
    
    // move many
    @Transactional
    public void moveEmails(List<String> emailIds, String targetFolderId) {
        Folder targetFolder = folderService.getFolderById(targetFolderId);
        for (String emailId : emailIds) {
            Email email = getEmailById(emailId);
            email.setFolder(targetFolder);
            emailRepository.save(email);
        }
    }
    // delte one 
    // not permanent 
    @Transactional
    public void deleteEmail(String emailId, String userId) {
        Email email = getEmailById(emailId);
        Folder trashFolder = folderService.getUserFolderByType(userId, FolderType.TRASH);
        email.setFolder(trashFolder);
        emailRepository.save(email);
    }

    // delete from trash final 
    
    @Transactional
    public void deletePermanently(String emailId) {
        emailRepository.deleteById(emailId);
    }

    // delte many not final just 
    
    @Transactional
    public void deleteMultipleEmails(List<String> emailIds, String userId) {
        Folder trashFolder = folderService.getUserFolderByType(userId, FolderType.TRASH);
        for (String emailId : emailIds) {
            Email email = getEmailById(emailId);
            email.setFolder(trashFolder);
            emailRepository.save(email);
        }
    }

// delet multible permenanet
     @Transactional
    public void deleteMultipleEmailsPermenanet(List<String> emailIds) {
        for (String emailId : emailIds) {
           this.deletePermanently(emailId);
        }
    }
    

    // this bounus 
    
    public long getUnreadCount(String folderId) {
        return emailRepository.countByFolderIdAndIsReadFalse(folderId);
    }

















































    
}
