package com.zycus.stockpulse.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class OrderSimulationRequest {
    @NotNull
    @Min(value = 1, message = "Order quantity must be at least 1")
    private Integer quantity;
    
    // Constructors
    public OrderSimulationRequest() {}
    
    // Getters and setters
    public Integer getQuantity() {
        return quantity;
    }
    
    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}