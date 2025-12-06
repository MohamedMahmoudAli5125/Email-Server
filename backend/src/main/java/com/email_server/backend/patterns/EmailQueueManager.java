package com.email_server.backend.patterns;

import com.email_server.backend.Entities.Email;

import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;


// why this pattern 
// this to make all send operation which my programe make in single queue 
// this for two 





public class EmailQueueManager {
private static EmailQueueManager instance;
    private final BlockingQueue<Email> emailQueue;
    // to save the request from
        // private final BlockingQueue<Pair<EmailDTO,String>> emailQueue2;

    private EmailQueueManager() {
        this.emailQueue = new LinkedBlockingQueue<>();
    }
    
    public static synchronized EmailQueueManager getInstance() {
        if (instance == null) {
            instance = new EmailQueueManager();
        }
        return instance;
    }
    
    public void enqueue(Email email) {
        try {
            emailQueue.put(email);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Failed to enqueue email", e);
        }
    }
    
    public Email dequeue() {
        try {
            return emailQueue.take();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Failed to dequeue email", e);
        }
    }
    
    public int getQueueSize() {
        return emailQueue.size();
    }
    
    public boolean isEmpty() {
        return emailQueue.isEmpty();
    }
}
