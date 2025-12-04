package Email_server.Backend.Dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;
import java.util.List;


@Data
public class ContactDTO {
    
    @NotBlank(message = "Contact name is required")
    private String name;
    
    @NotEmpty(message = "At least one email address is required")
    private List<String> emailAddresses;
}