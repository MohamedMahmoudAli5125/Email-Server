package com.email_server.backend.patterns.criteria;

import com.email_server.backend.Entities.Email;
import java.util.List;

/**
 * Criteria Pattern Interface
 * Based on the Filter/Criteria design pattern from your lecture
 * This filters a list of Email objects using different criteria
 */
public interface Criteria {
    /**
     * Filter the list of emails based on specific criteria
     * @param emails - List of emails to filter
     * @return Filtered list of emails
     */
    List<Email> meetCriteria(List<Email> emails);
}