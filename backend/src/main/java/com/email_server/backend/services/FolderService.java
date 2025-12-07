package com.email_server.backend.services;

import java.util.List;

import com.email_server.backend.Dto.FolderDTO;
import com.email_server.backend.Entities.Folder;
import com.email_server.backend.Entities.User;
import com.email_server.backend.Repositories.FolderRepository;
import com.email_server.backend.enums.FolderType;
import com.email_server.backend.patterns.Factory;
import com.email_server.backend.services.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;



@Service
public class FolderService {

// why if put final not work must write @No counstructor ???????
 private  final FolderRepository folderRepository;
    private  final UserService userService;

    public FolderService     (FolderRepository folderRepository, UserService userService) {
        this.folderRepository = folderRepository;
        this.userService = userService;
    }


// to get all folders of user  to show them in the right side of page and in here we get the custom ones
    public List<Folder> getUserFolders(String userId) {
        return folderRepository.findByUserId(userId);
    }


// to get folder by string id we give it in db
    public Folder getFolderById(String folderId) {
        return folderRepository.findById(folderId)
                .orElseThrow(() -> new RuntimeException("Folder not found"));
    }


// get by enum type we give
    public Folder getUserFolderByType(String userId, FolderType type) {
        return folderRepository.findByUserIdAndType(userId, type)
                .orElseThrow(() -> new RuntimeException("Folder not found"));
    }


// to create custom folder
    @Transactional
    public Folder createCustomFolder(String userId, FolderDTO folderDTO) {
        User user = userService.getUserById(userId);
        // check first not repeate the name
        if (folderRepository.existsByUserIdAndName(userId, folderDTO.getName())) {
            throw new RuntimeException("Folder name already exists");
        }
        // then create custom by the factory
        Folder folder = Factory.createCustomFolder(folderDTO.getName(), user);
        return folderRepository.save(folder);
    }


// rename i think not required
    @Transactional
    public Folder renameFolder(String folderId, String newName) {
        Folder folder = getFolderById(folderId);

        if (folder.getType() != FolderType.CUSTOM) {
            throw new RuntimeException("Cannot rename default folders");
        }

        if (folderRepository.existsByUserIdAndName(folder.getUser().getId(), newName)) {
            throw new RuntimeException("Folder name already exists");
        }

        folder.setName(newName);
        return folderRepository.save(folder);
    }


    // i think not required but we can make
    @Transactional
    public void deleteFolder(String folderId) {
        Folder folder = getFolderById(folderId);
        // check not default one
        if (folder.getType() != FolderType.CUSTOM) {
            throw new RuntimeException("Cannot delete default folders");
        }

        folderRepository.delete(folder);;
    }

}
