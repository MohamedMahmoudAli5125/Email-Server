package com.email_server.backend.patterns.criteria;

import com.email_server.backend.enums.EmailPriority;
import java.time.LocalDateTime;

/**
 * Factory Pattern for creating Criteria objects
 * Provides a centralized way to create different criteria types
 */
public class CriteriaFactory {

    public static Criteria createSubjectCriteria(String subject) {
        return new SubjectCriteria(subject);
    }

    public static Criteria createBodyCriteria(String body) {
        return new BodyCriteria(body);
    }

    public static Criteria createFromCriteria(String from) {
        return new FromCriteria(from);
    }

    public static Criteria createToCriteria(String to) {
        return new ToCriteria(to);
    }

    public static Criteria createHasAttachmentsCriteria(boolean hasAttachments) {
        return new HasAttachmentsCriteria(hasAttachments);
    }

    public static Criteria createPriorityCriteria(EmailPriority priority) {
        return new PriorityCriteria(priority);
    }

    public static Criteria createReadCriteria(boolean isRead) {
        return new ReadCriteria(isRead);
    }

    public static Criteria createImportantCriteria(boolean isImportant) {
        return new ImportantCriteria(isImportant);
    }

    public static Criteria createDateRangeCriteria(LocalDateTime startDate, LocalDateTime endDate) {
        return new DateRangeCriteria(startDate, endDate);
    }

    public static Criteria createAttachmentFileNameCriteria(String fileName) {
        return new AttachmentFileNameCriteria(fileName);
    }

    // Combinators
    public static Criteria createAndCriteria(Criteria criteria1, Criteria criteria2) {
        return new AndCriteria(criteria1, criteria2);
    }

    public static Criteria createOrCriteria(Criteria criteria1, Criteria criteria2) {
        return new OrCriteria(criteria1, criteria2);
    }

    public static Criteria createNotCriteria(Criteria criteria) {
        return new NotCriteria(criteria);
    }


    public static Criteria createSearchAllCriteria(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return emails -> emails; // Return all if no keyword
        }

        Criteria subjectCriteria = createSubjectCriteria(keyword);
        Criteria bodyCriteria = createBodyCriteria(keyword);
        Criteria fromCriteria = createFromCriteria(keyword);
        Criteria toCriteria = createToCriteria(keyword);
        Criteria attachmentCriteria = createAttachmentFileNameCriteria(keyword);

        // Combine with OR logic
        Criteria combined = createOrCriteria(subjectCriteria, bodyCriteria);
        combined = createOrCriteria(combined, fromCriteria);
        combined = createOrCriteria(combined, toCriteria);
        combined = createOrCriteria(combined, attachmentCriteria);

        return combined;
    }
}