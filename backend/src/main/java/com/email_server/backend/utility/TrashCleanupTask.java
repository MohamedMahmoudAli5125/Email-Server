package com.email_server.backend.utility;

import com.email_server.backend.Repositories.EmailRepository;
import jakarta.transaction.Transactional;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@EnableScheduling
public class TrashCleanupTask {

    private final EmailRepository emailRepository;

    public TrashCleanupTask(EmailRepository emailRepository) {
        this.emailRepository = emailRepository;
    }

    // Run every day at midnight
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void cleanupTrash() {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(30);
        emailRepository.deleteOldTrashEmails(cutoffDate);
        System.out.println("Trash cleanup completed at " + LocalDateTime.now());
    }
}
