package com.zycus.stockpulse.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class StockUpdateRequest {
    @NotNull
    @Min(value = 0, message = "Stock level cannot be negative")
    private Integer stockLevel;
    
    // Constructors
    public StockUpdateRequest() {}
    
    // Getters and setters
    public Integer getStockLevel() {
        return stockLevel;
    }
    
    public void setStockLevel(Integer stockLevel) {
        this.stockLevel = stockLevel;
    }
}