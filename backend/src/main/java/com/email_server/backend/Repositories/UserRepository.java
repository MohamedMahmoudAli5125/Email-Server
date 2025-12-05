package Email_server.Backend.Repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import Email_server.Backend.Entities.User;

public interface  UserRepository extends JpaRepository<User,String>  {
    // this for get user by its unique emial 
     Optional<User> findByEmail(String email);
    //  this for check we has this user or not
    boolean existsByEmail(String email);
}
