package com.email_server.backend.Facade.interfaces;


import com.email_server.backend.Dto.FolderDTO;
import com.email_server.backend.Entities.Folder;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;

public interface IFolderFacade {

    ResponseEntity<List<Folder>> getUserFolders(String userId);

    ResponseEntity<?> getFolderById(String folderId);

    ResponseEntity<?> createFolder(String userId, FolderDTO folderDTO);

    ResponseEntity<?> renameFolder(String folderId, FolderDTO request);

    ResponseEntity<?> deleteFolder(String folderId);
}