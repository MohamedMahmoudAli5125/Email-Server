package Email_server.Backend.Controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import Email_server.Backend.Dto.FolderDTO;
import Email_server.Backend.Entities.Folder;
import Email_server.Backend.services.FolderService;

@RestController
@RequestMapping("/api/folders")
@CrossOrigin(origins = "*")
public class FolderController {
    
    private final FolderService folderService;
    
    public FolderController(FolderService folderService) {
        this.folderService = folderService;
    }
    // get all folders of user to know to know ids of its folder this make after login
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Folder>> getUserFolders(@PathVariable String userId) {
        List<Folder> folders = folderService.getUserFolders(userId);
        return ResponseEntity.ok(folders);
    }
    // this get to just one folder information we not use it 
    @GetMapping("/{folderId}")
    public ResponseEntity<?> getFolderById(@PathVariable String folderId) {
        try {
            Folder folder = folderService.getFolderById(folderId);
            return ResponseEntity.ok(folder);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    // create custom folder for user 
    @PostMapping("/user/{userId}")
    public ResponseEntity<?> createFolder(@PathVariable String userId,
                                        @RequestBody FolderDTO folderDTO) {
        try {
            Folder folder = folderService.createCustomFolder(userId, folderDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(folder);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // update the custom folder first give me its id this can be bonus 
    // this map like the json  
    // i make it json
    
    @PutMapping("/{folderId}/rename")
    public ResponseEntity<?> renameFolder(@PathVariable String folderId,
                                         @RequestBody FolderDTO request) {
        try {
            // String newName = request.get("newName");
            Folder folder = folderService.renameFolder(folderId, request.getName());
            return ResponseEntity.ok(folder);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    // to delete any custom folder 
    @DeleteMapping("/{folderId}")
    public ResponseEntity<?> deleteFolder(@PathVariable String folderId) {
        try {
            folderService.deleteFolder(folderId);
            return ResponseEntity.ok(Map.of("message", "Folder deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
