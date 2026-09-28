package com.zycus.stockpulse.advisor;

import com.zycus.stockpulse.ai.LLMGateway;
import com.zycus.stockpulse.ai.PromptBuilder;
import com.zycus.stockpulse.ai.AiResponseParser;
import com.zycus.stockpulse.domain.Product;
import com.zycus.stockpulse.domain.enums.StrategyType;
import com.zycus.stockpulse.domain.enums.TriggerReason;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class AiCommerceAdvisor implements CommerceAdvisor {
    
    @Autowired
    private LLMGateway llmGateway;
    
    @Autowired
    private PromptBuilder promptBuilder;
    
    @Autowired
    private AiResponseParser responseParser;
    
    @Autowired
    private RuleBasedCommerceAdvisor fallbackAdvisor;
    
    @Override
    public StrategyType getStrategyType() {
        return StrategyType.AI;
    }
    
    @Override
    public PricingRecommendation generatePricingSuggestion(Product product, TriggerReason trigger, double categoryAvgVelocity) {
        try {
            String prompt = trigger == TriggerReason.INVENTORY_LOW ?
                promptBuilder.buildInventoryLowPrompt(product, categoryAvgVelocity) :
                promptBuilder.buildDemandSpikePrompt(product, categoryAvgVelocity);
            
            String response = llmGateway.callLLM(prompt);
            AiResponseParser.AiRecommendations recommendations = responseParser.parseAndValidate(response, product);
            
            return recommendations.getPricingRecommendation();
        } catch (Exception e) {
            // Fallback to rule-based advisor on any AI failure
            PricingRecommendation fallback = fallbackAdvisor.generatePricingSuggestion(product, trigger, categoryAvgVelocity);
            fallback.setReasoning("[Rule-Based Fallback]: LLM service unavailable or invalid response. " + fallback.getReasoning());
            return fallback;
        }
    }
    
    @Override
    public ReorderRecommendation generateReorderSuggestion(Product product, TriggerReason trigger, double categoryAvgVelocity) {
        try {
            String prompt = trigger == TriggerReason.INVENTORY_LOW ?
                promptBuilder.buildInventoryLowPrompt(product, categoryAvgVelocity) :
                promptBuilder.buildDemandSpikePrompt(product, categoryAvgVelocity);
            
            String response = llmGateway.callLLM(prompt);
            AiResponseParser.AiRecommendations recommendations = responseParser.parseAndValidate(response, product);
            
            return recommendations.getReorderRecommendation();
        } catch (Exception e) {
            // Fallback to rule-based advisor on any AI failure
            ReorderRecommendation fallback = fallbackAdvisor.generateReorderSuggestion(product, trigger, categoryAvgVelocity);
            fallback.setReasoning("[Rule-Based Fallback]: LLM service unavailable or invalid response. " + fallback.getReasoning());
            return fallback;
        }
    }
}