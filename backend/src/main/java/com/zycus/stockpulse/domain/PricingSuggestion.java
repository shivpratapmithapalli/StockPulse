package com.zycus.stockpulse.domain;

import com.zycus.stockpulse.domain.enums.ChangeDirection;
import com.zycus.stockpulse.domain.enums.SuggestionStatus;
import com.zycus.stockpulse.domain.enums.TriggerReason;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "pricing_suggestions")
public class PricingSuggestion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;
    
    private BigDecimal currentPrice;
    private BigDecimal recommendedPrice;
    
    @Enumerated(EnumType.STRING)
    private ChangeDirection changeDirection;
    
    private Double confidence;
    
    @Column(length = 2000)
    private String reasoning;
    
    @Enumerated(EnumType.STRING)
    private SuggestionStatus status;
    
    @Enumerated(EnumType.STRING)
    private TriggerReason triggerReason;
    
    private Instant createdAt;
    private Instant actionedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        status = SuggestionStatus.PENDING;
    }
    
    // Constructors
    public PricingSuggestion() {}
    
    // Getters and setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Product getProduct() {
        return product;
    }
    
    public void setProduct(Product product) {
        this.product = product;
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
    
    public Instant getActionedAt() {
        return actionedAt;
    }
    
    public void setActionedAt(Instant actionedAt) {
        this.actionedAt = actionedAt;
    }
}