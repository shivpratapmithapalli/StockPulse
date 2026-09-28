package com.zycus.stockpulse.advisor;

public class ReorderRecommendation {
    private Integer currentStock;
    private Integer recommendedQuantity;
    private Integer suggestedLeadTimeDays;
    private Double confidence;
    private String reasoning;
    
    // Constructors
    public ReorderRecommendation() {}
    
    // Getters and setters
    public Integer getCurrentStock() {
        return currentStock;
    }
    
    public void setCurrentStock(Integer currentStock) {
        this.currentStock = currentStock;
    }
    
    public Integer getRecommendedQuantity() {
        return recommendedQuantity;
    }
    
    public void setRecommendedQuantity(Integer recommendedQuantity) {
        this.recommendedQuantity = recommendedQuantity;
    }
    
    public Integer getSuggestedLeadTimeDays() {
        return suggestedLeadTimeDays;
    }
    
    public void setSuggestedLeadTimeDays(Integer suggestedLeadTimeDays) {
        this.suggestedLeadTimeDays = suggestedLeadTimeDays;
    }
    
    public Double getConfidence() {
        return confidence;
    }
    
    public void setConfidence(Double confidence) {
        this.confidence = confidence;
    }
    
    public String getReasoning() {
        return reasoning;
    }
    
    public void setReasoning(String reasoning) {
        this.reasoning = reasoning;
    }
}