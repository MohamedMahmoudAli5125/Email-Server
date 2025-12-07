package com.email_server.backend.Repositories;

import java.util.List;
import java.util.Optional;

import com.email_server.backend.Entities.Folder;
import com.email_server.backend.enums.FolderType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


// first the entity
@Repository
public interface FolderRepository extends JpaRepository<Folder,String> {



// to get all folder of user this take user id and search in foring key colom
 List<Folder> findByUserId(String userId);

//  this to get folder of user and for default one like inbox and sent and trash and all custom
    Optional<Folder> findByUserIdAndType(String userId, FolderType type);
    // this to take one folder of custom which user give them name as default we know its name
    Optional<Folder> findByUserIdAndName(String userId, String name);

    boolean existsByUserIdAndName(String userId, String name);



}
