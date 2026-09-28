package com.zycus.stockpulse.advisor;

import com.zycus.stockpulse.domain.Product;
import com.zycus.stockpulse.domain.enums.ChangeDirection;
import com.zycus.stockpulse.domain.enums.StrategyType;
import com.zycus.stockpulse.domain.enums.TriggerReason;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;

@Component
public class RuleBasedCommerceAdvisor implements CommerceAdvisor {
    
    @Override
    public StrategyType getStrategyType() {
        return StrategyType.RULE_BASED;
    }
    
    @Override
    public PricingRecommendation generatePricingSuggestion(Product product, TriggerReason trigger, double categoryAvgVelocity) {
        PricingRecommendation recommendation = new PricingRecommendation();
        recommendation.setCurrentPrice(product.getCurrentPrice());
        
        BigDecimal recommendedPrice;
        ChangeDirection direction;
        double confidence;
        String reasoning;
        
        if (trigger == TriggerReason.INVENTORY_LOW) {
            // Recommend +10% price increase for low stock
            recommendedPrice = product.getCurrentPrice().multiply(BigDecimal.valueOf(1.10));
            direction = ChangeDirection.INCREASE;
            confidence = 0.90;
            reasoning = String.format(
                "Stock level (%d) is below reorder threshold (%d). Recommended 10%% price increase to preserve inventory margin.",
                product.getStockLevel(), product.getReorderThreshold());
        } else if (trigger == TriggerReason.DEMAND_SPIKE) {
            // Recommend +5% price increase for high demand
            recommendedPrice = product.getCurrentPrice().multiply(BigDecimal.valueOf(1.05));
            direction = ChangeDirection.INCREASE;
            confidence = 0.85;
            reasoning = String.format(
                "Demand velocity (%d) exceeds category average (%.1f). Recommended 5%% price increase to capitalize on momentum.",
                product.getDemandVelocity(), categoryAvgVelocity);
        } else {
            // Hold price for manual requests or other cases
            recommendedPrice = product.getCurrentPrice();
            direction = ChangeDirection.HOLD;
            confidence = 0.70;
            reasoning = "No specific trigger detected. Maintaining current price.";
        }
        
        recommendation.setRecommendedPrice(recommendedPrice);
        recommendation.setDirection(direction);
        recommendation.setConfidence(confidence);
        recommendation.setReasoning(reasoning);
        
        return recommendation;
    }
    
    @Override
    public ReorderRecommendation generateReorderSuggestion(Product product, TriggerReason trigger, double categoryAvgVelocity) {
        ReorderRecommendation recommendation = new ReorderRecommendation();
        recommendation.setCurrentStock(product.getStockLevel());
        
        // Quantity = max(1, (reorderThreshold * 3) - currentStock)
        int recommendedQuantity = Math.max(1, (product.getReorderThreshold() * 3) - product.getStockLevel());
        int suggestedLeadTimeDays = 7; // Default lead time
        double confidence = 0.90;
        String reasoning = String.format(
            "Current inventory (%d units). Recommended %d units to cover 3x threshold cushion with 7-day lead time.",
            product.getStockLevel(), recommendedQuantity);
        
        recommendation.setRecommendedQuantity(recommendedQuantity);
        recommendation.setSuggestedLeadTimeDays(suggestedLeadTimeDays);
        recommendation.setConfidence(confidence);
        recommendation.setReasoning(reasoning);
        
        return recommendation;
    }
}