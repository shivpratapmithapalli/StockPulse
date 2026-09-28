package com.zycus.stockpulse.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zycus.stockpulse.advisor.PricingRecommendation;
import com.zycus.stockpulse.advisor.ReorderRecommendation;
import com.zycus.stockpulse.domain.Product;
import com.zycus.stockpulse.domain.enums.ChangeDirection;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;

@Component
public class AiResponseParser {
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    public AiRecommendations parseAndValidate(String jsonResponse, Product product) {
        try {
            // Extract JSON from Gemini response if needed
            JsonNode rootNode = objectMapper.readTree(jsonResponse);
            
            // Handle Gemini response structure
            if (rootNode.has("candidates")) {
                JsonNode candidates = rootNode.get("candidates");
                if (candidates.isArray() && candidates.size() > 0) {
                    JsonNode content = candidates.get(0).get("content");
                    if (content.has("parts")) {
                        JsonNode parts = content.get("parts");
                        if (parts.isArray() && parts.size() > 0) {
                            String text = parts.get(0).get("text").asText();
                            rootNode = objectMapper.readTree(text);
                        }
                    }
                }
            }
            
            // Parse the actual recommendations
            JsonNode pricingNode = rootNode.get("pricing");
            JsonNode reorderNode = rootNode.get("reorder");
            
            if (pricingNode == null || reorderNode == null) {
                throw new IllegalArgumentException("Invalid JSON structure: missing pricing or reorder sections");
            }
            
            // Validate pricing recommendation
            BigDecimal recommendedPrice = new BigDecimal(pricingNode.get("recommendedPrice").asText());
            if (recommendedPrice.compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("Recommended price must be positive");
            }
            
            // Apply sanity check: price shouldn't exceed 3x current price
            if (recommendedPrice.compareTo(product.getCurrentPrice().multiply(BigDecimal.valueOf(3.0))) > 0) {
                recommendedPrice = product.getCurrentPrice().multiply(BigDecimal.valueOf(3.0));
            }
            
            String directionStr = pricingNode.get("direction").asText();
            ChangeDirection direction = ChangeDirection.valueOf(directionStr);
            
            double pricingConfidence = pricingNode.get("confidence").asDouble();
            if (pricingConfidence < 0.0 || pricingConfidence > 1.0) {
                pricingConfidence = 0.5; // Default confidence
            }
            
            String pricingReasoning = pricingNode.get("reasoning").asText();
            
            // Validate reorder recommendation
            int recommendedQuantity = reorderNode.get("recommendedQuantity").asInt();
            if (recommendedQuantity < 1) {
                recommendedQuantity = 1;
            }
            
            double reorderConfidence = reorderNode.get("confidence").asDouble();
            if (reorderConfidence < 0.0 || reorderConfidence > 1.0) {
                reorderConfidence = 0.5; // Default confidence
            }
            
            int leadTimeDays = reorderNode.get("leadTimeDays").asInt();
            if (leadTimeDays < 1) {
                leadTimeDays = 7; // Default lead time
            }
            
            String reorderReasoning = reorderNode.get("reasoning").asText();
            
            // Create validated recommendations
            PricingRecommendation pricingRec = new PricingRecommendation();
            pricingRec.setCurrentPrice(product.getCurrentPrice());
            pricingRec.setRecommendedPrice(recommendedPrice);
            pricingRec.setDirection(direction);
            pricingRec.setConfidence(pricingConfidence);
            pricingRec.setReasoning(pricingReasoning);
            
            ReorderRecommendation reorderRec = new ReorderRecommendation();
            reorderRec.setCurrentStock(product.getStockLevel());
            reorderRec.setRecommendedQuantity(recommendedQuantity);
            reorderRec.setSuggestedLeadTimeDays(leadTimeDays);
            reorderRec.setConfidence(reorderConfidence);
            reorderRec.setReasoning(reorderReasoning);
            
            return new AiRecommendations(pricingRec, reorderRec);
            
        } catch (Exception e) {
            throw new IllegalArgumentException("Failed to parse or validate AI response: " + e.getMessage(), e);
        }
    }
    
    public static class AiRecommendations {
        private final PricingRecommendation pricingRecommendation;
        private final ReorderRecommendation reorderRecommendation;
        
        public AiRecommendations(PricingRecommendation pricing, ReorderRecommendation reorder) {
            this.pricingRecommendation = pricing;
            this.reorderRecommendation = reorder;
        }
        
        public PricingRecommendation getPricingRecommendation() {
            return pricingRecommendation;
        }
        
        public ReorderRecommendation getReorderRecommendation() {
            return reorderRecommendation;
        }
    }
}