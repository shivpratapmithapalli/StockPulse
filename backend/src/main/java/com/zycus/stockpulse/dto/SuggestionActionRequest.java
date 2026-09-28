package com.zycus.stockpulse.dto;

import jakarta.validation.constraints.NotNull;

public class SuggestionActionRequest {
    @NotNull
    private String action; // "ACCEPT" or "REJECT"
    
    // Constructors
    public SuggestionActionRequest() {}
    
    // Getters and setters
    public String getAction() {
        return action;
    }
    
    public void setAction(String action) {
        this.action = action;
    }
}