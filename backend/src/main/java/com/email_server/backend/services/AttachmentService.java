////package com.email_server.backend.Services;
////
////import java.io.File;
////import java.io.IOException;
////import java.nio.file.Files;
////import java.nio.file.Path;
////import java.nio.file.Paths;
////import java.util.ArrayList;
////import java.util.List;
////import java.util.UUID;
////
////import com.email_server.backend.Entities.Attachment;
////import com.email_server.backend.Entities.Email;
////import com.email_server.backend.Repositories.AttachmentRepository;
////import org.springframework.stereotype.Service;
////import org.springframework.transaction.annotation.Transactional;
////import org.springframework.web.multipart.MultipartFile;
////
////
////// first how we make this we save on my disk attachments and what in db and relations are the name size and path to not store in db
////// heavy things
////// so we store in dist and make my attachment entity
////
////@Service
////public class AttachmentService {
////
////    private final AttachmentRepository attachmentRepository;
////    // this start from our project and make this two directory
////    private static final String UPLOAD_DIR = "uploads/attachments/";
////
////    public AttachmentService(AttachmentRepository attachmentRepository) {
////        this.attachmentRepository = attachmentRepository;
////        createUploadDirectory();
////    }
////
////
////    // this to make first the directory to store if it not exist
////    private void createUploadDirectory() {
////
////        File directory = new File(UPLOAD_DIR);
////        if (!directory.exists()) {
////            directory.mkdirs();
////        }
////    }
////
////
////    // as you see we take attachments in MultipartFile what in frontend Dataframe
////    // we takee also list of them
////    // this method not save in tables just in disk and return liat oa Attachments which we will later save in tables
////    @Transactional
////    public List<Attachment> saveAttachments(List<MultipartFile> files, Email email) {
////        List<Attachment> attachments = new ArrayList<>();
////
////        if (files == null || files.isEmpty()) {
////            return attachments;
////        }
////
////        for (MultipartFile file : files) {
////            if (!file.isEmpty()) {
////                try {
////                    // .isEmpty() if no file and  not have thing
////                    // .getContentType return the type of the file like that application/pdf
////                    // this return like file.pdf
////                    // get name return <input =file name="" > this tag in forntend
////                    // lastIndexOf the index after this char
////                    // .getSize give size in numer of  bytes
////                    // .getBytes return byte[]
////                    // inputstram transferto to save rather than Files.werite
////                    String originalFilename = file.getOriginalFilename();
////
////                    String fileExtension = originalFilename != null && originalFilename.contains(".")
////                            ? originalFilename.substring(originalFilename.lastIndexOf("."))
////                            : "";
////// UUID retun random number to store file in place not two ones make overwrite on both
////
////
////                    String uniqueFilename = UUID.randomUUID().toString() + fileExtension;
////                    String filePath = UPLOAD_DIR + uniqueFilename;
////
////                    // Save file to disk
////                    Path path = Paths.get(filePath);
////                    Files.write(path, file.getBytes());
////
////
////                    // Create attachment entity
////                    Attachment attachment = Attachment.builder()
////                            .fileName(originalFilename)
////                            .fileType(file.getContentType())
////                            .filePath(filePath)
////                            .fileSize(file.getSize())
////                            .email(email)
////                            .build();
////
////                    attachments.add(attachment);
////
////                } catch (IOException e) {
////                    throw new RuntimeException("Failed to save attachment: " + file.getOriginalFilename(), e);
////                }
////            }
////        }
////
//////        return attachments;
////        return attachmentRepository.saveAll(attachments);
////    }
////    @Transactional
////    public List<Attachment> saveAttachments(List<MultipartFile> files) {
////        List<Attachment> attachments = new ArrayList<>();
////
////        if (files == null || files.isEmpty()) {
////            return attachments;
////        }
////
////        for (MultipartFile file : files) {
////            if (!file.isEmpty()) {
////                try {
////                    // .isEmpty() if no file and  not have thing
////                    // .getContentType return the type of the file like that application/pdf
////                    // this return like file.pdf
////                    // get name return <input =file name="" > this tag in forntend
////                    // lastIndexOf the index after this char
////                    // .getSize give size in numer of  bytes
////                    // .getBytes return byte[]
////                    // inputstram transferto to save rather than Files.werite
////                    String originalFilename = file.getOriginalFilename();
////
////                    String fileExtension = originalFilename != null && originalFilename.contains(".")
////                            ? originalFilename.substring(originalFilename.lastIndexOf("."))
////                            : "";
////// UUID retun random number to store file in place not two ones make overwrite on both
////
////
////                    String uniqueFilename = UUID.randomUUID().toString() + fileExtension;
////                    String filePath = UPLOAD_DIR + uniqueFilename;
////
////                    // Save file to disk
////                    Path path = Paths.get(filePath);
////                    Files.write(path, file.getBytes());
////
////
////                    // Create attachment entity
////                    Attachment attachment = Attachment.builder()
////                            .fileName(originalFilename)
////                            .fileType(file.getContentType())
////                            .filePath(filePath)
////                            .fileSize(file.getSize())
////                            .build();
////
////                    attachments.add(attachment);
////
////                } catch (IOException e) {
////                    throw new RuntimeException("Failed to save attachment: " + file.getOriginalFilename(), e);
////                }
////            }
////        }
////
////        return attachments;
////    }
////
////
////    public Attachment getAttachment(String attachmentId) {
////        return attachmentRepository.findById(attachmentId)
////                .orElseThrow(() -> new RuntimeException("Attachment not found"));
////    }
////
////    // to retrive the bytes of our entity attachment  this recived in frontend by string
////    public byte[] getAttachmentFile(String attachmentId) {
////        Attachment attachment = getAttachment(attachmentId);
////        try {
////            Path path = Paths.get(attachment.getFilePath());
////            return Files.readAllBytes(path);
////        } catch (IOException e) {
////            throw new RuntimeException("Failed to read attachment file", e);
////        }
////    }
////
////
////    // get attachments entitys of certian emial findall
////    public List<Attachment> getEmailAttachments(String emailId) {
////        return attachmentRepository.findByEmailId(emailId);
////    }
////
////    // this to makee update on the emial he sent not required          we can make as bonus sent email he can update
////    @Transactional
////    public void deleteAttachment(String attachmentId) {
////        Attachment attachment = getAttachment(attachmentId);
////
////        // Delete file from disk
////        try {
////            Path path = Paths.get(attachment.getFilePath());
////            Files.deleteIfExists(path);
////        } catch (IOException e) {
////            throw new RuntimeException("Failed to delete attachment file", e);
////        }
////
////        attachmentRepository.delete(attachment);
////    }
////}
//package com.email_server.backend.Services;
//
//import java.io.ByteArrayOutputStream;
//import java.io.File;
//import java.io.IOException;
//import java.nio.file.Files;
//import java.nio.file.Path;
//import java.nio.file.Paths;
//import java.util.ArrayList;
//import java.util.List;
//import java.util.UUID;
//import java.util.zip.ZipEntry;
//import java.util.zip.ZipOutputStream;
//
//import com.email_server.backend.Entities.Attachment;
//import com.email_server.backend.Entities.Email;
//import com.email_server.backend.Repositories.AttachmentRepository;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//import org.springframework.web.multipart.MultipartFile;
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
//    private void createUploadDirectory() {
//        File directory = new File(UPLOAD_DIR);
//        if (!directory.exists()) {
//            directory.mkdirs();
//        }
//    }
//
//    @Transactional
//    public List<Attachment> saveAttachments(List<MultipartFile> files, Email email) {
//        List<Attachment> attachments = new ArrayList<>();
//
//        if (files == null || files.isEmpty()) {
//            return attachments;
//        }
//
//        for (MultipartFile file : files) {
//            if (!file.isEmpty()) {
//                try {
//                    String originalFilename = file.getOriginalFilename();
//                    String fileExtension = originalFilename != null && originalFilename.contains(".")
//                            ? originalFilename.substring(originalFilename.lastIndexOf("."))
//                            : "";
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
//                            .email(email)
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
//        return attachmentRepository.saveAll(attachments);
//    }
//
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
//                    String originalFilename = file.getOriginalFilename();
//                    String fileExtension = originalFilename != null && originalFilename.contains(".")
//                            ? originalFilename.substring(originalFilename.lastIndexOf("."))
//                            : "";
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
//    /**
//     * NEW: Create a ZIP file containing all attachments for an email
//     */
//    public byte[] createZipOfAttachments(String emailId) {
//        List<Attachment> attachments = getEmailAttachments(emailId);
//
//        if (attachments.isEmpty()) {
//            throw new RuntimeException("No attachments found for email");
//        }
//
//        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
//             ZipOutputStream zos = new ZipOutputStream(baos)) {
//
//            for (Attachment attachment : attachments) {
//                // Read the file from disk
//                Path path = Paths.get(attachment.getFilePath());
//                byte[] fileData = Files.readAllBytes(path);
//
//                // Create a zip entry with the original filename
//                // Handle duplicate filenames by appending a counter
//                String entryName = attachment.getFileName();
//                ZipEntry zipEntry = new ZipEntry(entryName);
//                zos.putNextEntry(zipEntry);
//                zos.write(fileData);
//                zos.closeEntry();
//            }
//
//            zos.finish();
//            return baos.toByteArray();
//
//        } catch (IOException e) {
//            throw new RuntimeException("Failed to create ZIP file", e);
//        }
//    }
//
//    /**
//     * NEW: Create a ZIP file containing specific attachments
//     */
//    public byte[] createZipOfAttachments(List<String> attachmentIds) {
//        if (attachmentIds == null || attachmentIds.isEmpty()) {
//            throw new RuntimeException("No attachment IDs provided");
//        }
//
//        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
//             ZipOutputStream zos = new ZipOutputStream(baos)) {
//
//            for (String attachmentId : attachmentIds) {
//                Attachment attachment = getAttachment(attachmentId);
//
//                // Read the file from disk
//                Path path = Paths.get(attachment.getFilePath());
//                byte[] fileData = Files.readAllBytes(path);
//
//                // Create a zip entry with the original filename
//                ZipEntry zipEntry = new ZipEntry(attachment.getFileName());
//                zos.putNextEntry(zipEntry);
//                zos.write(fileData);
//                zos.closeEntry();
//            }
//
//            zos.finish();
//            return baos.toByteArray();
//
//        } catch (IOException e) {
//            throw new RuntimeException("Failed to create ZIP file", e);
//        }
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