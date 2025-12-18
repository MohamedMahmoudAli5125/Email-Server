//import com.email_server.backend.Facade.interfaces.IFolderFacade; // Add this import
//// CHANGE THIS LINE:
//private final IFolderFacade folderFacade; // Changed from FolderService
//
//        // CHANGE CONSTRUCTOR:
//        public FolderController(IFolderFacade folderFacade) { // Changed parameter type
//            this.folderFacade = folderFacade; // Changed assignment
//        }
//        return folderFacade.getUserFolders(userId);
//        return folderFacade.getFolderById(folderId);
//        return folderFacade.createFolder(userId, folderDTO);
//        return folderFacade.renameFolder(folderId, request);
//        return folderFacade.deleteFolder(folderId);
//




package com.email_server.backend.Facade.implementations;
import com.email_server.backend.Dto.FolderDTO;
import com.email_server.backend.Entities.Folder;
import com.email_server.backend.Facade.interfaces.IFolderFacade;
import com.email_server.backend.Services.FolderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Component
public class FolderFacade implements IFolderFacade {

    private final FolderService folderService;

    public FolderFacade(FolderService folderService) {
        this.folderService = folderService;
    }

    @Override
    public ResponseEntity<List<Folder>> getUserFolders(String userId) {
        List<Folder> folders = folderService.getUserFolders(userId);
        return ResponseEntity.ok(folders);
    }

    @Override
    public ResponseEntity<?> getFolderById(String folderId) {
        try {
            Folder folder = folderService.getFolderById(folderId);
            return ResponseEntity.ok(folder);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Override
    @Transactional
    public ResponseEntity<?> createFolder(String userId, FolderDTO folderDTO) {
        try {
            Folder folder = folderService.createCustomFolder(userId, folderDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(folder);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @Override
    @Transactional
    public ResponseEntity<?> renameFolder(String folderId, FolderDTO request) {
        try {
            Folder folder = folderService.renameFolder(folderId, request.getName());
            return ResponseEntity.ok(folder);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @Override
    @Transactional
    public ResponseEntity<?> deleteFolder(String folderId) {
        try {
            folderService.deleteFolder(folderId);
            return ResponseEntity.ok(Map.of("message", "Folder deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}