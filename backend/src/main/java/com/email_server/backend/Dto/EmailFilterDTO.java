package com.email_server.backend.Dto;

import com.email_server.backend.enums.EmailPriority;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailFilterDTO {

    private String searchKeyword;

    // Filter fields (AND logic - all specified filters must match)
    private String subject;
    private String body;
    private String from;
    private String to;

    private EmailPriority priority;
    private Boolean hasAttachments;
    private Boolean isRead;
    private Boolean isImportant;

    private LocalDateTime startDate;
    private LocalDateTime endDate;

    // Sorting
    private String sortBy = "sentDate"; // sentDate, priority, subject, fromEmail
    private String sortDirection = "desc"; // asc, desc

    // Pagination
    @Builder.Default
    private int page = 0;

    @Builder.Default
    private int size = 20;
}