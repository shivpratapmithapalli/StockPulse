package com.zycus.stockpulse.advisor;

import com.zycus.stockpulse.domain.Product;
import com.zycus.stockpulse.domain.enums.StrategyType;
import com.zycus.stockpulse.domain.enums.TriggerReason;
import java.math.BigDecimal;

public interface CommerceAdvisor {
    StrategyType getStrategyType();
    PricingRecommendation generatePricingSuggestion(Product product, TriggerReason trigger, double categoryAvgVelocity);
    ReorderRecommendation generateReorderSuggestion(Product product, TriggerReason trigger, double categoryAvgVelocity);
}