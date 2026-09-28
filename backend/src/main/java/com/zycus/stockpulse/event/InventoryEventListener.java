package com.zycus.stockpulse.event;

import com.zycus.stockpulse.domain.Product;
import com.zycus.stockpulse.domain.PricingSuggestion;
import com.zycus.stockpulse.domain.ReorderSuggestion;
import com.zycus.stockpulse.domain.enums.SuggestionStatus;
import com.zycus.stockpulse.domain.enums.TriggerReason;
import com.zycus.stockpulse.advisor.CommerceAdvisor;
import com.zycus.stockpulse.advisor.AdvisorRegistry;
import com.zycus.stockpulse.repository.PricingSuggestionRepository;
import com.zycus.stockpulse.repository.ReorderSuggestionRepository;
import com.zycus.stockpulse.repository.ProductRepository;
import com.zycus.stockpulse.service.CategoryAnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
public class InventoryEventListener {
    
    @Autowired
    private AdvisorRegistry advisorRegistry;
    
    @Autowired
    private PricingSuggestionRepository pricingSuggestionRepository;
    
    @Autowired
    private ReorderSuggestionRepository reorderSuggestionRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private CategoryAnalyticsService categoryAnalyticsService;
    
    @EventListener
    @Async
    public void handleInventorySignal(InventorySignalEvent event) {
        Product product = event.getProduct();
        
        // Check for triggers
        boolean isInventoryLow = product.getStockLevel() < product.getReorderThreshold();
        boolean isDemandSpike = categoryAnalyticsService.isDemandSpike(product);
        
        // Process triggers
        if (isInventoryLow || isDemandSpike) {
            TriggerReason triggerReason = isInventoryLow ? TriggerReason.INVENTORY_LOW : TriggerReason.DEMAND_SPIKE;
            
            // Check for duplicate pending suggestions
            boolean pricingExists = pricingSuggestionRepository.existsByProductAndTriggerReasonAndStatus(
                product, triggerReason, SuggestionStatus.PENDING);
                
            boolean reorderExists = reorderSuggestionRepository.existsByProductAndTriggerReasonAndStatus(
                product, triggerReason, SuggestionStatus.PENDING);
            
            if (!pricingExists || !reorderExists) {
                // Generate recommendations
                CommerceAdvisor advisor = advisorRegistry.getActiveAdvisor();
                double categoryAvgVelocity = categoryAnalyticsService.getCategoryAverageDemandVelocity(product.getCategory());
                
                // Generate pricing suggestion
                if (!pricingExists) {
                    com.zycus.stockpulse.advisor.PricingRecommendation pricingRec = advisor.generatePricingSuggestion(
                        product, triggerReason, categoryAvgVelocity);
                    
                    PricingSuggestion pricingSuggestion = new PricingSuggestion();
                    pricingSuggestion.setProduct(product);
                    pricingSuggestion.setCurrentPrice(pricingRec.getCurrentPrice());
                    pricingSuggestion.setRecommendedPrice(pricingRec.getRecommendedPrice());
                    pricingSuggestion.setChangeDirection(pricingRec.getDirection());
                    pricingSuggestion.setConfidence(pricingRec.getConfidence());
                    pricingSuggestion.setReasoning(pricingRec.getReasoning());
                    pricingSuggestion.setTriggerReason(triggerReason);
                    
                    pricingSuggestionRepository.save(pricingSuggestion);
                }
                
                // Generate reorder suggestion
                if (!reorderExists) {
                    com.zycus.stockpulse.advisor.ReorderRecommendation reorderRec = advisor.generateReorderSuggestion(
                        product, triggerReason, categoryAvgVelocity);
                    
                    ReorderSuggestion reorderSuggestion = new ReorderSuggestion();
                    reorderSuggestion.setProduct(product);
                    reorderSuggestion.setCurrentStock(reorderRec.getCurrentStock());
                    reorderSuggestion.setRecommendedQuantity(reorderRec.getRecommendedQuantity());
                    reorderSuggestion.setSuggestedLeadTimeDays(reorderRec.getSuggestedLeadTimeDays());
                    reorderSuggestion.setConfidence(reorderRec.getConfidence());
                    reorderSuggestion.setReasoning(reorderRec.getReasoning());
                    reorderSuggestion.setTriggerReason(triggerReason);
                    
                    reorderSuggestionRepository.save(reorderSuggestion);
                }
                
                // Update product status
                if (product.getStatus() == com.zycus.stockpulse.domain.enums.ProductStatus.ACTIVE) {
                    product.setStatus(com.zycus.stockpulse.domain.enums.ProductStatus.PRICE_REVIEW_PENDING);
                    productRepository.save(product);
                }
            }
        }
    }
}