package Email_server.Backend.patterns;

import Email_server.Backend.Entities.Folder;
import Email_server.Backend.enums.FolderType;
import Email_server.Backend.Entities.User;

public class Factory {
 public static Folder createFolder(FolderType type, User user) {
    // this crate folser and determint the name according the type    
    Folder folder = Folder.builder()
                .type(type)
                .user(user)
                .build();
        
        switch (type) {
            case INBOX:
                folder.setName("Inbox");
                break;
            case SENT:
                folder.setName("Sent");
                break;
            case DRAFT:
                folder.setName("Drafts");
                break;
            case TRASH:
                folder.setName("Trash");
                break;
            case CUSTOM:
                folder.setName("Custom Folder");
                break;
            default:
                throw new IllegalArgumentException("Unknown folder type: " + type);
        }
        
        return folder;
    }
    // this create customFolder to the user and get user to connect each other 
    public static Folder createCustomFolder(String name, User user) {
        return Folder.builder()
                .name(name)
                .type(FolderType.CUSTOM)
                .user(user)
                .build();
}



// this crate the defaut folders of user after each sigh up 
  public static void createDefaultFolders(User user) {
        user.addFolder(createFolder(FolderType.INBOX, user));
        user.addFolder(createFolder(FolderType.SENT, user));
        user.addFolder(createFolder(FolderType.DRAFT, user));
        user.addFolder(createFolder(FolderType.TRASH, user));
    }




}