package com.email_server.backend.Services;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import com.email_server.backend.Entities.Attachment;
import com.email_server.backend.Entities.Email;
import com.email_server.backend.Repositories.AttachmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class AttachmentService {

    private final AttachmentRepository attachmentRepository;
    private static final String UPLOAD_DIR = "uploads/attachments/";

    public AttachmentService(AttachmentRepository attachmentRepository) {
        this.attachmentRepository = attachmentRepository;
        createUploadDirectory();
    }

    private void createUploadDirectory() {
        File directory = new File(UPLOAD_DIR);
        if (!directory.exists()) {
            directory.mkdirs();
        }
    }

    /**
     * Save attachments with email reference (Many-to-One)
     */
    @Transactional
    public List<Attachment> saveAttachments(List<MultipartFile> files, Email email) {
        List<Attachment> attachments = new ArrayList<>();

        if (files == null || files.isEmpty()) {
            return attachments;
        }

        for (MultipartFile file : files) {
            if (!file.isEmpty()) {
                try {
                    String originalFilename = file.getOriginalFilename();
                    String fileExtension = originalFilename != null && originalFilename.contains(".")
                            ? originalFilename.substring(originalFilename.lastIndexOf("."))
                            : "";

                    String uniqueFilename = UUID.randomUUID().toString() + fileExtension;
                    String filePath = UPLOAD_DIR + uniqueFilename;

                    // Save file to disk
                    Path path = Paths.get(filePath);
                    Files.write(path, file.getBytes());

                    // Create attachment entity with email reference
                    Attachment attachment = Attachment.builder()
                            .fileName(originalFilename)
                            .fileType(file.getContentType())
                            .filePath(filePath)
                            .fileSize(file.getSize())
                            .email(email)
                            .build();

                    attachments.add(attachment);

                } catch (IOException e) {
                    throw new RuntimeException("Failed to save attachment: " + file.getOriginalFilename(), e);
                }
            }
        }

        return attachmentRepository.saveAll(attachments);
    }

    /**
     * Save attachments without email reference (for drafts being created)
     */
    @Transactional
    public List<Attachment> saveAttachments(List<MultipartFile> files) {
        List<Attachment> attachments = new ArrayList<>();

        if (files == null || files.isEmpty()) {
            return attachments;
        }

        for (MultipartFile file : files) {
            if (!file.isEmpty()) {
                try {
                    String originalFilename = file.getOriginalFilename();
                    String fileExtension = originalFilename != null && originalFilename.contains(".")
                            ? originalFilename.substring(originalFilename.lastIndexOf("."))
                            : "";

                    String uniqueFilename = UUID.randomUUID().toString() + fileExtension;
                    String filePath = UPLOAD_DIR + uniqueFilename;

                    Path path = Paths.get(filePath);
                    Files.write(path, file.getBytes());

                    Attachment attachment = Attachment.builder()
                            .fileName(originalFilename)
                            .fileType(file.getContentType())
                            .filePath(filePath)
                            .fileSize(file.getSize())
                            .build();

                    attachments.add(attachment);

                } catch (IOException e) {
                    throw new RuntimeException("Failed to save attachment: " + file.getOriginalFilename(), e);
                }
            }
        }

        return attachments;
    }

    public Attachment getAttachment(String attachmentId) {
        return attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new RuntimeException("Attachment not found"));
    }

    public byte[] getAttachmentFile(String attachmentId) {
        Attachment attachment = getAttachment(attachmentId);
        try {
            Path path = Paths.get(attachment.getFilePath());
            return Files.readAllBytes(path);
        } catch (IOException e) {
            throw new RuntimeException("Failed to read attachment file", e);
        }
    }

    public List<Attachment> getEmailAttachments(String emailId) {
        return attachmentRepository.findByEmailId(emailId);
    }

    /**
     * Create a ZIP file containing all attachments for an email
     */
    public byte[] createZipOfAttachments(String emailId) {
        List<Attachment> attachments = getEmailAttachments(emailId);

        if (attachments.isEmpty()) {
            throw new RuntimeException("No attachments found for email");
        }

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
             ZipOutputStream zos = new ZipOutputStream(baos)) {

            for (Attachment attachment : attachments) {
                Path path = Paths.get(attachment.getFilePath());
                byte[] fileData = Files.readAllBytes(path);

                ZipEntry zipEntry = new ZipEntry(attachment.getFileName());
                zos.putNextEntry(zipEntry);
                zos.write(fileData);
                zos.closeEntry();
            }

            zos.finish();
            return baos.toByteArray();

        } catch (IOException e) {
            throw new RuntimeException("Failed to create ZIP file", e);
        }
    }

    /**
     * Create a ZIP file containing specific attachments
     */
    public byte[] createZipOfAttachments(List<String> attachmentIds) {
        if (attachmentIds == null || attachmentIds.isEmpty()) {
            throw new RuntimeException("No attachment IDs provided");
        }

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
             ZipOutputStream zos = new ZipOutputStream(baos)) {

            for (String attachmentId : attachmentIds) {
                Attachment attachment = getAttachment(attachmentId);

                Path path = Paths.get(attachment.getFilePath());
                byte[] fileData = Files.readAllBytes(path);

                ZipEntry zipEntry = new ZipEntry(attachment.getFileName());
                zos.putNextEntry(zipEntry);
                zos.write(fileData);
                zos.closeEntry();
            }

            zos.finish();
            return baos.toByteArray();

        } catch (IOException e) {
            throw new RuntimeException("Failed to create ZIP file", e);
        }
    }

    @Transactional
    public void deleteAttachment(String attachmentId) {
        Attachment attachment = getAttachment(attachmentId);

        // Delete file from disk
        try {
            Path path = Paths.get(attachment.getFilePath());
            Files.deleteIfExists(path);
        } catch (IOException e) {
            throw new RuntimeException("Failed to delete attachment file", e);
        }

        attachmentRepository.delete(attachment);
    }


}