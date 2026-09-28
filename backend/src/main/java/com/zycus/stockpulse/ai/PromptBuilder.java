package com.zycus.stockpulse.ai;

import com.zycus.stockpulse.domain.Product;
import org.springframework.stereotype.Component;

@Component
public class PromptBuilder {
    
    public String buildInventoryLowPrompt(Product product, double categoryAvgVelocity) {
        return String.format("""
            You are an expert retail merchandiser. Analyze this product's situation:
            
            Product: %s (%s)
            Category: %s
            Current Price: $%.2f
            Current Stock: %d units
            Reorder Threshold: %d units
            Demand Velocity: %d orders/24h
            Category Average Velocity: %.1f orders/24h
            
            Situation: Stock is critically low (below reorder threshold). You must decide:
            1. Should we increase price to preserve margin on scarce inventory?
            2. Should we offer a clearance discount to move units quickly?
            3. Should we hold price and wait for reorder?
            
            Consider:
            - Scarcity value vs. obsolescence risk
            - Customer price sensitivity
            - Historical sales patterns
            
            Respond ONLY with valid JSON in this exact format:
            {
              "pricing": {
                "recommendedPrice": [number, strictly positive],
                "direction": "[INCREASE|DECREASE|HOLD]",
                "confidence": [number between 0.0-1.0],
                "reasoning": "[plain English explanation]"
              },
              "reorder": {
                "recommendedQuantity": [positive integer],
                "confidence": [number between 0.0-1.0],
                "leadTimeDays": [positive integer],
                "reasoning": "[plain English explanation]"
              }
            }
            """, 
            product.getName(), product.getSku(), product.getCategory(),
            product.getCurrentPrice(), product.getStockLevel(), product.getReorderThreshold(),
            product.getDemandVelocity(), categoryAvgVelocity);
    }
    
    public String buildDemandSpikePrompt(Product product, double categoryAvgVelocity) {
        return String.format("""
            You are an expert retail merchandiser. Analyze this product's situation:
            
            Product: %s (%s)
            Category: %s
            Current Price: $%.2f
            Current Stock: %d units
            Demand Velocity: %d orders/24h
            Category Average Velocity: %.1f orders/24h
            
            Situation: Demand has spiked significantly above category average. You must decide:
            1. Should we increase price to capitalize on high demand?
            2. Should we hold price to maintain momentum?
            3. Should we decrease price to satisfy even more demand?
            
            Consider:
            - Conversion rate sensitivity to price changes
            - Inventory sufficiency for sustained demand
            - Competitive positioning
            
            Respond ONLY with valid JSON in this exact format:
            {
              "pricing": {
                "recommendedPrice": [number, strictly positive],
                "direction": "[INCREASE|DECREASE|HOLD]",
                "confidence": [number between 0.0-1.0],
                "reasoning": "[plain English explanation]"
              },
              "reorder": {
                "recommendedQuantity": [positive integer],
                "confidence": [number between 0.0-1.0],
                "leadTimeDays": [positive integer],
                "reasoning": "[plain English explanation]"
              }
            }
            """, 
            product.getName(), product.getSku(), product.getCategory(),
            product.getCurrentPrice(), product.getStockLevel(),
            product.getDemandVelocity(), categoryAvgVelocity);
    }
}