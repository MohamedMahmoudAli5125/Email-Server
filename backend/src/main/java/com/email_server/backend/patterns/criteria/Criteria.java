package com.email_server.backend.patterns.criteria;

import com.email_server.backend.Entities.Email;
import java.util.List;

public interface Criteria {

    List<Email> meetCriteria(List<Email> emails);
}