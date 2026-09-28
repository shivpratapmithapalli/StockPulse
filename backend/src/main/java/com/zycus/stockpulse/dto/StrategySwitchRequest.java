package com.zycus.stockpulse.dto;

import com.zycus.stockpulse.domain.enums.StrategyType;
import jakarta.validation.constraints.NotNull;

public class StrategySwitchRequest {
    @NotNull
    private StrategyType strategy;
    
    // Constructors
    public StrategySwitchRequest() {}
    
    // Getters and setters
    public StrategyType getStrategy() {
        return strategy;
    }
    
    public void setStrategy(StrategyType strategy) {
        this.strategy = strategy;
    }
}