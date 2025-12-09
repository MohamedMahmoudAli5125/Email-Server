package com.email_server.backend.patterns.criteria;

import com.email_server.backend.Entities.Email;

import java.util.ArrayList;
import java.util.List;

public class OrCriteria implements Criteria {
        private Criteria criteria;
        private Criteria otherCriteria;

    public OrCriteria(Criteria criteria, Criteria otherCriteria) {
            this.criteria = criteria;
            this.otherCriteria = otherCriteria;
        }

        @Override
        public List<Email> meetCriteria(List<Email> emails) {
            List<Email> firstCriteriaItems = criteria.meetCriteria(emails);
            List<Email> otherCriteriaItems = otherCriteria.meetCriteria(emails);

            // Combine and remove duplicates
            List<Email> combined = new ArrayList<>(firstCriteriaItems);

            for (Email email : otherCriteriaItems) {
                if (!combined.contains(email)) {
                    combined.add(email);
                }
            }

            return combined;
        }

}
