package com.zycus.stockpulse.dto;

import java.util.List;

public class SuggestionsBundleResponse {
    private List<PricingSuggestionDTO> pricingSuggestions;
    private List<ReorderSuggestionDTO> reorderSuggestions;
    
    // Constructors
    public SuggestionsBundleResponse() {}
    
    // Getters and setters
    public List<PricingSuggestionDTO> getPricingSuggestions() {
        return pricingSuggestions;
    }
    
    public void setPricingSuggestions(List<PricingSuggestionDTO> pricingSuggestions) {
        this.pricingSuggestions = pricingSuggestions;
    }
    
    public List<ReorderSuggestionDTO> getReorderSuggestions() {
        return reorderSuggestions;
    }
    
    public void setReorderSuggestions(List<ReorderSuggestionDTO> reorderSuggestions) {
        this.reorderSuggestions = reorderSuggestions;
    }
}