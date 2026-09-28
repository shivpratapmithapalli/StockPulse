package com.zycus.stockpulse.domain;

import com.zycus.stockpulse.domain.enums.Category;
import com.zycus.stockpulse.domain.enums.ProductStatus;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
public class Product {
    @Id
    private String id;
    
    @Column(unique = true)
    private String sku;
    
    private String name;
    
    @Enumerated(EnumType.STRING)
    private Category category;
    
    private BigDecimal currentPrice;
    
    private Integer stockLevel;
    
    private Integer reorderThreshold;
    
    private Integer demandVelocity;
    
    @Enumerated(EnumType.STRING)
    private ProductStatus status;
    
    // Relationships
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<PricingSuggestion> pricingSuggestions = new ArrayList<>();
    
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ReorderSuggestion> reorderSuggestions = new ArrayList<>();
    
    // Sprint 2 Extension Fields (Nullable for forward compatibility)
    private BigDecimal costPrice;
    private BigDecimal marginFloor;
    private String supplierId;
    
    private Instant createdAt;
    private Instant updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
    
    // Constructors, getters, setters
    public Product() {}
    
    public Product(String id, String sku, String name, Category category, 
                   BigDecimal currentPrice, Integer stockLevel, Integer reorderThreshold) {
        this.id = id;
        this.sku = sku;
        this.name = name;
        this.category = category;
        this.currentPrice = currentPrice;
        this.stockLevel = stockLevel;
        this.reorderThreshold = reorderThreshold;
        this.demandVelocity = 0;
        this.status = ProductStatus.ACTIVE;
    }
    
    // Getters and setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getSku() {
        return sku;
    }
    
    public void setSku(String sku) {
        this.sku = sku;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public Category getCategory() {
        return category;
    }
    
    public void setCategory(Category category) {
        this.category = category;
    }
    
    public BigDecimal getCurrentPrice() {
        return currentPrice;
    }
    
    public void setCurrentPrice(BigDecimal currentPrice) {
        this.currentPrice = currentPrice;
    }
    
    public Integer getStockLevel() {
        return stockLevel;
    }
    
    public void setStockLevel(Integer stockLevel) {
        this.stockLevel = stockLevel;
    }
    
    public Integer getReorderThreshold() {
        return reorderThreshold;
    }
    
    public void setReorderThreshold(Integer reorderThreshold) {
        this.reorderThreshold = reorderThreshold;
    }
    
    public Integer getDemandVelocity() {
        return demandVelocity;
    }
    
    public void setDemandVelocity(Integer demandVelocity) {
        this.demandVelocity = demandVelocity;
    }
    
    public ProductStatus getStatus() {
        return status;
    }
    
    public void setStatus(ProductStatus status) {
        this.status = status;
    }
    
    public List<PricingSuggestion> getPricingSuggestions() {
        return pricingSuggestions;
    }
    
    public void setPricingSuggestions(List<PricingSuggestion> pricingSuggestions) {
        this.pricingSuggestions = pricingSuggestions;
    }
    
    public List<ReorderSuggestion> getReorderSuggestions() {
        return reorderSuggestions;
    }
    
    public void setReorderSuggestions(List<ReorderSuggestion> reorderSuggestions) {
        this.reorderSuggestions = reorderSuggestions;
    }
    
    public BigDecimal getCostPrice() {
        return costPrice;
    }
    
    public void setCostPrice(BigDecimal costPrice) {
        this.costPrice = costPrice;
    }
    
    public BigDecimal getMarginFloor() {
        return marginFloor;
    }
    
    public void setMarginFloor(BigDecimal marginFloor) {
        this.marginFloor = marginFloor;
    }
    
    public String getSupplierId() {
        return supplierId;
    }
    
    public void setSupplierId(String supplierId) {
        this.supplierId = supplierId;
    }
    
    public Instant getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
    
    public Instant getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}