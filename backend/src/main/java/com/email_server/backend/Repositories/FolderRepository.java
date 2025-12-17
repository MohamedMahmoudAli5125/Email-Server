package com.email_server.backend.Repositories;

import java.util.List;
import java.util.Optional;

import com.email_server.backend.Entities.Folder;
import com.email_server.backend.enums.FolderType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FolderRepository extends JpaRepository<Folder, String> {

    List<Folder> findByUserId(String userId);

    Optional<Folder> findByUserIdAndType(String userId, FolderType type);

    Optional<Folder> findByUserIdAndName(String userId, String name);

    boolean existsByUserIdAndName(String userId, String name);
}