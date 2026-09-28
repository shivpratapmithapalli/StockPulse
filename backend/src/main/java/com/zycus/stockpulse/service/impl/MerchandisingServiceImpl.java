package com.zycus.stockpulse.service.impl;

import com.zycus.stockpulse.domain.Product;
import com.zycus.stockpulse.domain.enums.ProductStatus;
import com.zycus.stockpulse.domain.PricingSuggestion;
import com.zycus.stockpulse.domain.ReorderSuggestion;
import com.zycus.stockpulse.domain.enums.SuggestionStatus;
import com.zycus.stockpulse.dto.PricingSuggestionDTO;
import com.zycus.stockpulse.dto.ReorderSuggestionDTO;
import com.zycus.stockpulse.dto.SuggestionsBundleResponse;
import com.zycus.stockpulse.exception.ResourceNotFoundException;
import com.zycus.stockpulse.repository.ProductRepository;
import com.zycus.stockpulse.repository.PricingSuggestionRepository;
import com.zycus.stockpulse.repository.ReorderSuggestionRepository;
import com.zycus.stockpulse.service.MerchandisingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class MerchandisingServiceImpl implements MerchandisingService {
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private PricingSuggestionRepository pricingSuggestionRepository;
    
    @Autowired
    private ReorderSuggestionRepository reorderSuggestionRepository;
    
    @Override
    public List<Product> getPendingProducts() {
        // Get products with pending pricing suggestions
        List<Product> pricingPending = productRepository.findProductsWithPendingPricingSuggestions();
        // Get products with pending reorder suggestions
        List<Product> reorderPending = productRepository.findProductsWithPendingReorderSuggestions();
        
        // Combine and deduplicate
        Set<String> productIds = new HashSet<>();
        List<Product> result = new ArrayList<>();
        
        for (Product product : pricingPending) {
            if (productIds.add(product.getId())) {
                result.add(product);
            }
        }
        
        for (Product product : reorderPending) {
            if (productIds.add(product.getId())) {
                result.add(product);
            }
        }
        
        return result;
    }
    
    @Override
    public SuggestionsBundleResponse getProductSuggestions(String productId) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + productId));
        
        List<PricingSuggestion> pricingSuggestions = pricingSuggestionRepository.findByProductIdAndStatus(
            productId, SuggestionStatus.PENDING);
            
        List<ReorderSuggestion> reorderSuggestions = reorderSuggestionRepository.findByProductIdAndStatus(
            productId, SuggestionStatus.PENDING);
        
        SuggestionsBundleResponse response = new SuggestionsBundleResponse();
        
        // Convert pricing suggestions to DTOs
        List<PricingSuggestionDTO> pricingDTOs = pricingSuggestions.stream()
            .map(this::convertToPricingDTO)
            .collect(Collectors.toList());
            
        // Convert reorder suggestions to DTOs
        List<ReorderSuggestionDTO> reorderDTOs = reorderSuggestions.stream()
            .map(this::convertToReorderDTO)
            .collect(Collectors.toList());
        
        response.setPricingSuggestions(pricingDTOs);
        response.setReorderSuggestions(reorderDTOs);
        
        return response;
    }
    
    @Override
    public void processPricingSuggestion(Long suggestionId, String action) {
        PricingSuggestion suggestion = pricingSuggestionRepository.findById(suggestionId)
            .orElseThrow(() -> new ResourceNotFoundException("Pricing suggestion not found with ID: " + suggestionId));
        
        if ("ACCEPT".equals(action)) {
            suggestion.setStatus(SuggestionStatus.ACCEPTED);
            suggestion.setActionedAt(java.time.Instant.now());
            
            // Update product price
            Product product = suggestion.getProduct();
            product.setCurrentPrice(suggestion.getRecommendedPrice());
            
            // Check if we should restore product status
            checkAndRestoreProductStatus(product);
        } else if ("REJECT".equals(action)) {
            suggestion.setStatus(SuggestionStatus.REJECTED);
            suggestion.setActionedAt(java.time.Instant.now());
        }
        
        pricingSuggestionRepository.save(suggestion);
    }
    
    @Override
    public void processReorderSuggestion(Long suggestionId, String action) {
        ReorderSuggestion suggestion = reorderSuggestionRepository.findById(suggestionId)
            .orElseThrow(() -> new ResourceNotFoundException("Reorder suggestion not found with ID: " + suggestionId));
        
        if ("ACCEPT".equals(action)) {
            suggestion.setStatus(SuggestionStatus.ACCEPTED);
            suggestion.setActionedAt(java.time.Instant.now());
            
            // Simulate inbound shipment
            Product product = suggestion.getProduct();
            int newStockLevel = product.getStockLevel() + suggestion.getRecommendedQuantity();
            product.setStockLevel(newStockLevel);
            
            // Check if we should restore product status
            checkAndRestoreProductStatus(product);
        } else if ("REJECT".equals(action)) {
            suggestion.setStatus(SuggestionStatus.REJECTED);
            suggestion.setActionedAt(java.time.Instant.now());
        }
        
        reorderSuggestionRepository.save(suggestion);
    }
    
    private void checkAndRestoreProductStatus(Product product) {
        // Check if there are any pending suggestions for this product
        boolean hasPendingPricing = pricingSuggestionRepository.findByProductIdAndStatus(
            product.getId(), SuggestionStatus.PENDING).size() > 0;
            
        boolean hasPendingReorder = reorderSuggestionRepository.findByProductIdAndStatus(
            product.getId(), SuggestionStatus.PENDING).size() > 0;
        
        // If no pending suggestions and product is not OUT_OF_STOCK, restore to ACTIVE
        if (!hasPendingPricing && !hasPendingReorder && product.getStockLevel() > 0) {
            product.setStatus(ProductStatus.ACTIVE);
        } else if (product.getStockLevel() == 0) {
            product.setStatus(ProductStatus.OUT_OF_STOCK);
        }
        
        productRepository.save(product);
    }
    
    private PricingSuggestionDTO convertToPricingDTO(PricingSuggestion suggestion) {
        PricingSuggestionDTO dto = new PricingSuggestionDTO();
        dto.setId(suggestion.getId());
        dto.setCurrentPrice(suggestion.getCurrentPrice());
        dto.setRecommendedPrice(suggestion.getRecommendedPrice());
        dto.setChangeDirection(suggestion.getChangeDirection());
        dto.setConfidence(suggestion.getConfidence());
        dto.setReasoning(suggestion.getReasoning());
        dto.setStatus(suggestion.getStatus());
        dto.setTriggerReason(suggestion.getTriggerReason());
        dto.setCreatedAt(suggestion.getCreatedAt());
        return dto;
    }
    
    private ReorderSuggestionDTO convertToReorderDTO(ReorderSuggestion suggestion) {
        ReorderSuggestionDTO dto = new ReorderSuggestionDTO();
        dto.setId(suggestion.getId());
        dto.setCurrentStock(suggestion.getCurrentStock());
        dto.setRecommendedQuantity(suggestion.getRecommendedQuantity());
        dto.setSuggestedLeadTimeDays(suggestion.getSuggestedLeadTimeDays());
        dto.setConfidence(suggestion.getConfidence());
        dto.setReasoning(suggestion.getReasoning());
        dto.setStatus(suggestion.getStatus());
        dto.setTriggerReason(suggestion.getTriggerReason());
        dto.setCreatedAt(suggestion.getCreatedAt());
        return dto;
    }
}