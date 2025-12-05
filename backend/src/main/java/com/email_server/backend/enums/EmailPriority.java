package com.email_server.backend.enums;

public enum EmailPriority {
    LOW(1),
    NORMAL(2),
    HIGH(3),
    URGENT(4);
    
    private final int value;
    
    EmailPriority(int value) {
        this.value = value;
    }
    
    public int getValue() {
        return value;
    }
    
    public static EmailPriority fromValue(int value) {
        for (EmailPriority priority : values()) {
            if (priority.value == value) {
                return priority;
            }
        }
        return NORMAL;
    }
}