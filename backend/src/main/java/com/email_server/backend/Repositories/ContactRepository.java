package Email_server.Backend.Repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import Email_server.Backend.Entities.Contact;

public interface  ContactRepository extends JpaRepository<String, Contact> {

     List<Contact> findByUserId(String userId);

     
// those consider as filter 

    // those also bounus as he donot need search in contacts just first one to get all contacts of user 
    @Query("SELECT c FROM Contact c WHERE c.user.id = :userId AND LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Contact> searchByName(@Param("userId") String userId, @Param("keyword") String keyword);
    // this mean that you have list c.emailAdresses any member in it is called e 
    @Query("SELECT c FROM Contact c JOIN c.emailAddresses e WHERE c.user.id = :userId AND LOWER(e) LIKE LOWER(CONCAT('%', :email, '%'))")
    List<Contact> searchByEmail(@Param("userId") String userId, @Param("email") String email);



// this also bounus make search by two of them emials or  name 
    @Query("SELECT c FROM Contact c JOIN c.emailAddresses e WHERE c.user.id = :userId AND LOWER(e) LIKE LOWER(CONCAT('%', :email, '%'))  OR "+
    "  LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%'))    ")

    List<Contact> searchByAll(@Param("userId") String userId, @Param("email") String email);








}
