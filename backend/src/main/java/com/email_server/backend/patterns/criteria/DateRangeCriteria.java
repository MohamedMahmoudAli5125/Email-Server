package com.email_server.backend.patterns.criteria;

import com.email_server.backend.Entities.Email;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class DateRangeCriteria implements Criteria {

    private LocalDateTime startDate;
    private LocalDateTime endDate;

    public DateRangeCriteria(LocalDateTime startDate, LocalDateTime endDate) {
        this.startDate = startDate;
        this.endDate = endDate;
    }

    @Override
    public List<Email> meetCriteria(List<Email> emails) {
        return emails.stream()
                .filter(email -> {
                    LocalDateTime sentDate = email.getSentDate();
                    if (sentDate == null) return false;

                    boolean afterStart = startDate == null ||
                            !sentDate.isBefore(startDate);
                    boolean beforeEnd = endDate == null ||
                            !sentDate.isAfter(endDate);

                    return afterStart && beforeEnd;
                })
                .collect(Collectors.toList());
    }

}
