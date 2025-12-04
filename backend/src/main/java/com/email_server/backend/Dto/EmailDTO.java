package Email_server.Backend.Dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import Email_server.Backend.enums.EmailPriority;

import java.util.ArrayList;
import java.util.List;

@Data
public class EmailDTO {
    
    @NotBlank(message = "Sender email is required")
    private String from;
    
    @NotEmpty(message = "At least one recipient is required")
    private List<String> to = new ArrayList<>();
    
    private List<String> cc = new ArrayList<>();
    private List<String> bcc = new ArrayList<>();
    
    @NotBlank(message = "Subject is required")
    private String subject;
    
    private String body;
    private EmailPriority priority = EmailPriority.NORMAL;
    private List<MultipartFile> attachmentFiles;
}