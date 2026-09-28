package com.zycus.stockpulse.advisor;

import com.zycus.stockpulse.domain.enums.ChangeDirection;
import java.math.BigDecimal;

public class PricingRecommendation {
    private BigDecimal currentPrice;
    private BigDecimal recommendedPrice;
    private ChangeDirection direction;
    private Double confidence;
    private String reasoning;
    
    // Constructors
    public PricingRecommendation() {}
    
    // Getters and setters
    public BigDecimal getCurrentPrice() {
        return currentPrice;
    }
    
    public void setCurrentPrice(BigDecimal currentPrice) {
        this.currentPrice = currentPrice;
    }
    
    public BigDecimal getRecommendedPrice() {
        return recommendedPrice;
    }
    
    public void setRecommendedPrice(BigDecimal recommendedPrice) {
        this.recommendedPrice = recommendedPrice;
    }
    
    public ChangeDirection getDirection() {
        return direction;
    }
    
    public void setDirection(ChangeDirection direction) {
        this.direction = direction;
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