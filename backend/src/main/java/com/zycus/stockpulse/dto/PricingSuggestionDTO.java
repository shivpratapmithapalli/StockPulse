package com.zycus.stockpulse.dto;

import com.zycus.stockpulse.domain.enums.ChangeDirection;
import com.zycus.stockpulse.domain.enums.SuggestionStatus;
import com.zycus.stockpulse.domain.enums.TriggerReason;
import java.math.BigDecimal;
import java.time.Instant;

public class PricingSuggestionDTO {
    private Long id;
    private BigDecimal currentPrice;
    private BigDecimal recommendedPrice;
    private ChangeDirection changeDirection;
    private Double confidence;
    private String reasoning;
    private SuggestionStatus status;
    private TriggerReason triggerReason;
    private Instant createdAt;
    
    // Constructors
    public PricingSuggestionDTO() {}
    
    // Getters and setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
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
    
    public ChangeDirection getChangeDirection() {
        return changeDirection;
    }
    
    public void setChangeDirection(ChangeDirection changeDirection) {
        this.changeDirection = changeDirection;
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
    
    public SuggestionStatus getStatus() {
        return status;
    }
    
    public void setStatus(SuggestionStatus status) {
        this.status = status;
    }
    
    public TriggerReason getTriggerReason() {
        return triggerReason;
    }
    
    public void setTriggerReason(TriggerReason triggerReason) {
        this.triggerReason = triggerReason;
    }
    
    public Instant getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}