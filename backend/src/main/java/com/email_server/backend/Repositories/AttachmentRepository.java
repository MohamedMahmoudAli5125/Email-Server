package Email_server.Backend.Repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import Email_server.Backend.Entities.Attachment;
import java.util.List;

public interface AttachmentRepository extends JpaRepository<String , Attachment> {
    List<Attachment> findByEmailId(String emailId);
}
