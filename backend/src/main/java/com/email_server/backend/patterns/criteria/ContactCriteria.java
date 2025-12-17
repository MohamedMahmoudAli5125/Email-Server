package com.email_server.backend.patterns.criteria;

import com.email_server.backend.Entities.Contact;
import java.util.List;

public interface ContactCriteria {
    List<Contact> meetCriteria(List<Contact> contacts);
}