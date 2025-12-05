package com.email_server.backend.Repositories;

import java.time.LocalDateTime;

import org.springframework.boot.data.autoconfigure.web.DataWebProperties.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.email_server.backend.Entities.Email;
import com.email_server.backend.enums.EmailPriority;

public interface EmailRepository  extends JpaRepository<String, Email> {

// this pageable what tell to db give the first 10 first 20 we give the method thie in service  and return page (mean here the first rows )
// we need this to return the emails of certian folder for by folder id as forign key
Page<Email> findByFolderId(String folderId, Pageable pageable);
    
// this return for certain forlder and not read to be in first if we need as external filter 
Page<Email> findByFolderIdAndIsReadFalse(String folderId, Pageable pageable);
    
    // this return if the emial is important who make the emiail important or not is sender and also what make the prioriy is he 
    Page<Email> findByFolderIdAndIsImportantTrue(String folderId, Pageable pageable);
    
    // this retrung dreaft true but not need ans first one enough and we not need draft flag in email 
    Page<Email> findByFolderIdAndIsDraftTrue(String folderId, Pageable pageable);
    
    // Search by subject this retun if the 
    // this not sql and mean select e mean entity emial 
    // from Email e mean table Eamil of entity emial 
    // e.folder 
    // :folderId :  this mean  take as paramter not hard copy
    // Lower conver to lower casses to avoid case senstive 
    // Like to search for pattern 
    // %keyWord% mean kajsdklfjdsk keyword sklajkldjkfj  any accoure for this pattern in the code 
    // we need it as he want to search in subject and sender and attachmeant  


//   this three consider filter but we want make it by our self filter design pattern as we take all emials first and then filter them by required one 
// by filter desing pattern or by make Specifcation class this filter to search reuslt or the emial in folder
    @Query("SELECT e FROM Email e WHERE e.folder.id = :folderId AND LOWER(e.subject) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Email> searchBySubject(@Param("folderId") String folderId, @Param("keyword") String keyword, Pageable pageable);
    
    // Search by sender
    @Query("SELECT e FROM Email e WHERE e.folder.id = :folderId AND LOWER(e.fromEmail) LIKE LOWER(CONCAT('%', :sender, '%'))")
    Page<Email> searchBySender(@Param("folderId") String folderId, @Param("sender") String sender, Pageable pageable);
    
    // Search by body
    @Query("SELECT e FROM Email e WHERE e.folder.id = :folderId AND LOWER(e.body) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Email> searchByBody(@Param("folderId") String folderId, @Param("keyword") String keyword, Pageable pageable);
    
    // Search by just attachment
     @Query("SELECT e FROM Email e   Join e.attachments b      WHERE e.folder.id = :folderId AND LOWER(b.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Email> searchByAttachment(@Param("folderId") String folderId, @Param("keyword") String keyword, Pageable pageable);
    


// and we want filter by sender and subject and we can make it  
// by filter desing pattern all of them make class to filter by those four things and  or make thing called SPEcification in spring boot 
@Query("SELECT e FROM Email e  Join e.attachments b    WHERE e.folder.id = :folderId And "+ 
" LOWER(e.body) LIKE LOWER (CONCAT('%',:Keyword,'%') ) OR  "+
"LOWER(e.subject) LIKE LOWER (CONCAT('%',:Keyword,'%') ) OR "+
"LOWER(e.sender) LIKE LOWER (CONCAT('%',:Keyword,'%') )  OR "+
" LOWER(b.name) LIKE LOWER (CONCAT('%',:Keyword,'%') )   "
)
    Page<Email> searchByAll(@Param("folderId") String folderId, @Param("keyword") String keyword, Pageable pageable);




// the reutlt of search or the emials in folder we need to sort them in Date or inportance if he ask we make or by two 




    // Find by priority this mean user chose priority and make filter to what in the page for this prioriy                bonus 
    Page<Email> findByFolderIdAndPriority(String folderId, EmailPriority priority, Pageable pageable);
    
    // Find emails with attachments  this also bounus filter for emails which has attachmeants                            bonus 
    @Query("SELECT e FROM Email e WHERE e.folder.id = :folderId AND SIZE(e.attachments) > 0")
    Page<Email> findEmailsWithAttachments(@Param("folderId") String folderId, Pageable pageable);
    
    // Delete old emails from trash
    @Query("DELETE FROM Email e WHERE e.folder.type = 'TRASH' AND e.sentDate < :cutoffDate")
    void deleteOldTrashEmails(@Param("cutoffDate") LocalDateTime cutoffDate);
    
    // Count unread emails in folder                                                                                   bonus 
    long countByFolderIdAndIsReadFalse(String folderId);



}
