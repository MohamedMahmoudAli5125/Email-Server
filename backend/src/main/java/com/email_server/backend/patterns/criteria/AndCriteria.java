package com.email_server.backend.patterns.criteria;

import com.email_server.backend.Entities.Email;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class AndCriteria implements Criteria {
    private Criteria criteria;
    private Criteria otherCriteria;

    public AndCriteria(Criteria criteria, Criteria otherCriteria) {
        this.criteria = criteria;
        this.otherCriteria = otherCriteria;
    }

    @Override
    public List<Email> meetCriteria(List<Email> emails) {
        List<Email> firstCriteriaEmails = criteria.meetCriteria(emails);
        return otherCriteria.meetCriteria(firstCriteriaEmails);
    }
}