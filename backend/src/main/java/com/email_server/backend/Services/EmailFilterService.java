package com.email_server.backend.Services;

import com.email_server.backend.Dto.EmailFilterDTO;
import com.email_server.backend.Entities.Email;
import com.email_server.backend.patterns.criteria.Criteria;
import com.email_server.backend.patterns.criteria.CriteriaFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EmailFilterService {
    public List<Email> searchEmails(List<Email> emails, String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return new ArrayList<>(emails);
        }

        Criteria searchCriteria = CriteriaFactory.createSearchAllCriteria(keyword);
        return searchCriteria.meetCriteria(emails);
    }

    public List<Email> filterEmails(List<Email> emails, EmailFilterDTO filterDTO) {
        List<Email> result = new ArrayList<>(emails);

        // Build criteria chain with AND logic
        Criteria combinedCriteria = null;

        // Filter by subject
        if (filterDTO.getSubject() != null && !filterDTO.getSubject().trim().isEmpty()) {
            Criteria criteria = CriteriaFactory.createSubjectCriteria(filterDTO.getSubject());
            combinedCriteria = combineCriteria(combinedCriteria, criteria);
        }

        // Filter by body
        if (filterDTO.getBody() != null && !filterDTO.getBody().trim().isEmpty()) {
            Criteria criteria = CriteriaFactory.createBodyCriteria(filterDTO.getBody());
            combinedCriteria = combineCriteria(combinedCriteria, criteria);
        }

        // Filter by from
        if (filterDTO.getFrom() != null && !filterDTO.getFrom().trim().isEmpty()) {
            Criteria criteria = CriteriaFactory.createFromCriteria(filterDTO.getFrom());
            combinedCriteria = combineCriteria(combinedCriteria, criteria);
        }

        // Filter by to
        if (filterDTO.getTo() != null && !filterDTO.getTo().trim().isEmpty()) {
            Criteria criteria = CriteriaFactory.createToCriteria(filterDTO.getTo());
            combinedCriteria = combineCriteria(combinedCriteria, criteria);
        }

        // Filter by has attachments
        if (filterDTO.getHasAttachments() != null) {
            Criteria criteria = CriteriaFactory.createHasAttachmentsCriteria(filterDTO.getHasAttachments());
            combinedCriteria = combineCriteria(combinedCriteria, criteria);
        }

        // Filter by priority
        if (filterDTO.getPriority() != null) {
            Criteria criteria = CriteriaFactory.createPriorityCriteria(filterDTO.getPriority());
            combinedCriteria = combineCriteria(combinedCriteria, criteria);
        }

        // Filter by read status
        if (filterDTO.getIsRead() != null) {
            Criteria criteria = CriteriaFactory.createReadCriteria(filterDTO.getIsRead());
            combinedCriteria = combineCriteria(combinedCriteria, criteria);
        }

        // Filter by important status
        if (filterDTO.getIsImportant() != null) {
            Criteria criteria = CriteriaFactory.createImportantCriteria(filterDTO.getIsImportant());
            combinedCriteria = combineCriteria(combinedCriteria, criteria);
        }

        // Filter by date range
        if (filterDTO.getStartDate() != null || filterDTO.getEndDate() != null) {
            Criteria criteria = CriteriaFactory.createDateRangeCriteria(
                    filterDTO.getStartDate(),
                    filterDTO.getEndDate()
            );
            combinedCriteria = combineCriteria(combinedCriteria, criteria);
        }

        // Apply combined criteria
        if (combinedCriteria != null) {
            result = combinedCriteria.meetCriteria(result);
        }

        // Sort results
        result = sortEmails(result, filterDTO.getSortBy(), filterDTO.getSortDirection());

        return result;
    }

    public List<Email> searchAndFilter(List<Email> emails, EmailFilterDTO filterDTO) {
        List<Email> result = emails;

        // First: Apply search (OR logic)
        if (filterDTO.getSearchKeyword() != null && !filterDTO.getSearchKeyword().trim().isEmpty()) {
            result = searchEmails(result, filterDTO.getSearchKeyword());
        }

        // Second: Apply filters (AND logic)
        result = filterEmails(result, filterDTO);

        return result;
    }

    /**
     * Helper method to combine criteria with AND logic
     */
    private Criteria combineCriteria(Criteria existing, Criteria newCriteria) {
        if (existing == null) {
            return newCriteria;
        }
        return CriteriaFactory.createAndCriteria(existing, newCriteria);
    }

    /**
     * Sort emails based on field and direction
     */
    public List<Email> sortEmails(List<Email> emails, String sortBy, String sortDirection) {
        boolean ascending = "asc".equalsIgnoreCase(sortDirection);

        Comparator<Email> comparator = switch (sortBy != null ? sortBy : "sentDate") {
            case "subject" -> Comparator.comparing(Email::getSubject,
                    Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER));
            case "fromEmail" -> Comparator.comparing(Email::getFromEmail,
                    Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER));
            case "priority" -> Comparator.comparing(Email::getPriority,
                    Comparator.nullsLast(Comparator.naturalOrder()));
            default -> Comparator.comparing(Email::getSentDate,
                    Comparator.nullsLast(Comparator.naturalOrder()));
        };

        if (!ascending) {
            comparator = comparator.reversed();
        }

        return emails.stream()
                .sorted(comparator)
                .collect(Collectors.toList());
    }

    public List<Email> paginate(List<Email> emails, int page, int size) {
        int start = page * size;
        int end = Math.min(start + size, emails.size());

        if (start >= emails.size()) {
            return new ArrayList<>();
        }

        return emails.subList(start, end);
    }
}
