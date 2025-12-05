//package Email_server.Backend.services;
//
//import java.io.File;
//import java.io.IOException;
//import java.nio.file.Files;
//import java.nio.file.Path;
//import java.nio.file.Paths;
//import java.util.ArrayList;
//import java.util.List;
//import java.util.UUID;
//
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//import org.springframework.web.multipart.MultipartFile;
//
//import Email_server.Backend.Entities.Attachment;
//import Email_server.Backend.Repositories.AttachmentRepository;
//// first how we make this we save on my disk attachments and what in db and relations are the name size and path to not store in db
//// heavy things
//// so we store in dist and make my attachment entity
//
//@Service
//public class AttachmentService {
//
//    private final AttachmentRepository attachmentRepository;
//    private static final String UPLOAD_DIR = "uploads/attachments/";
//
//    public AttachmentService(AttachmentRepository attachmentRepository) {
//        this.attachmentRepository = attachmentRepository;
//        createUploadDirectory();
//    }
//
//
//    // this to make first the directory to store if it not exist
//    private void createUploadDirectory() {
//
//        File directory = new File(UPLOAD_DIR);
//        if (!directory.exists()) {
//            directory.mkdirs();
//        }
//    }
//
//
//    // as you see we take attachments in MultipartFile what in frontend Dataframe
//    // we takee also list of them
//    // this method not save in tables just in disk and return liat oa Attachments which we will later save in tables
//    @Transactional
//    public List<Attachment> saveAttachments(List<MultipartFile> files) {
//        List<Attachment> attachments = new ArrayList<>();
//
//        if (files == null || files.isEmpty()) {
//            return attachments;
//        }
//
//        for (MultipartFile file : files) {
//            if (!file.isEmpty()) {
//                try {
//                    // .isEmpty() if no file and  not have thing
//                    // .getContentType return the type of the file like that application/pdf
//                    // this return like file.pdf
//                    // get name return <input =file name="" > this tag in forntend
//                    // lastIndexOf the index after this char
//                    // .getSize give size in bytes return byte[]
//                    // inputstram transferto to save rather than Files.werite
//                    String originalFilename = file.getOriginalFilename();
//
//                    String fileExtension = originalFilename != null && originalFilename.contains(".")
//                        ? originalFilename.substring(originalFilename.lastIndexOf("."))
//                        : "";
//
//                    String uniqueFilename = UUID.randomUUID().toString() + fileExtension;
//                    String filePath = UPLOAD_DIR + uniqueFilename;
//
//                    // Save file to disk
//                    Path path = Paths.get(filePath);
//                    Files.write(path, file.getBytes());
//
//                    // Create attachment entity
//                    Attachment attachment = Attachment.builder()
//                            .fileName(originalFilename)
//                            .fileType(file.getContentType())
//                            .filePath(filePath)
//                            .fileSize(file.getSize())
//                            .build();
//
//                    attachments.add(attachment);
//
//                } catch (IOException e) {
//                    throw new RuntimeException("Failed to save attachment: " + file.getOriginalFilename(), e);
//                }
//            }
//        }
//
//        return attachments;
//    }
//
//    public Attachment getAttachment(String attachmentId) {
//        return attachmentRepository.findById(attachmentId)
//                .orElseThrow(() -> new RuntimeException("Attachment not found"));
//    }
//
//    public byte[] getAttachmentFile(String attachmentId) {
//        Attachment attachment = getAttachment(attachmentId);
//        try {
//            Path path = Paths.get(attachment.getFilePath());
//            return Files.readAllBytes(path);
//        } catch (IOException e) {
//            throw new RuntimeException("Failed to read attachment file", e);
//        }
//    }
//
//    public List<Attachment> getEmailAttachments(String emailId) {
//        return attachmentRepository.findByEmailId(emailId);
//    }
//
//    @Transactional
//    public void deleteAttachment(String attachmentId) {
//        Attachment attachment = getAttachment(attachmentId);
//
//        // Delete file from disk
//        try {
//            Path path = Paths.get(attachment.getFilePath());
//            Files.deleteIfExists(path);
//        } catch (IOException e) {
//            throw new RuntimeException("Failed to delete attachment file", e);
//        }
//
//        attachmentRepository.delete(attachment);
//    }
//}
