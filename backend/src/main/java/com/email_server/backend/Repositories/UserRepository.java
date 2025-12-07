package com.email_server.backend.Repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.email_server.backend.Entities.User;
import org.springframework.stereotype.Repository;


@Repository
public interface  UserRepository extends JpaRepository<User,String>  {
    // this for get user by its unique emial 
     Optional<User> findByEmail(String email);
    //  this for check we has this user or not
    boolean existsByEmail(String email);
}
