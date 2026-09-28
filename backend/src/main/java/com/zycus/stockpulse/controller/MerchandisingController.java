package com.zycus.stockpulse.controller;

import com.zycus.stockpulse.domain.Product;
import com.zycus.stockpulse.dto.ProductDTO;
import com.zycus.stockpulse.dto.SuggestionActionRequest;
import com.zycus.stockpulse.service.MerchandisingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/merchandising")
public class MerchandisingController {
    
    @Autowired
    private MerchandisingService merchandisingService;
    
    @GetMapping("/pending")
    public ResponseEntity<List<ProductDTO>> getPendingProducts() {
        List<Product> products = merchandisingService.getPendingProducts();
        // Convert to DTOs
        List<ProductDTO> productDTOs = products.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(productDTOs);
    }
    
    @PatchMapping("/pricing-suggestions/{id}")
    public ResponseEntity<Void> processPricingSuggestion(@PathVariable Long id,
                                                        @Valid @RequestBody SuggestionActionRequest request) {
        merchandisingService.processPricingSuggestion(id, request.getAction());
        return ResponseEntity.noContent().build();
    }
    
    @PatchMapping("/reorder-suggestions/{id}")
    public ResponseEntity<Void> processReorderSuggestion(@PathVariable Long id,
                                                        @Valid @RequestBody SuggestionActionRequest request) {
        merchandisingService.processReorderSuggestion(id, request.getAction());
        return ResponseEntity.noContent().build();
    }
    
    private ProductDTO convertToDTO(Product product) {
        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setSku(product.getSku());
        dto.setName(product.getName());
        dto.setCategory(product.getCategory());
        dto.setCurrentPrice(product.getCurrentPrice());
        dto.setStockLevel(product.getStockLevel());
        dto.setReorderThreshold(product.getReorderThreshold());
        dto.setDemandVelocity(product.getDemandVelocity());
        dto.setStatus(product.getStatus());
        dto.setCostPrice(product.getCostPrice());
        dto.setMarginFloor(product.getMarginFloor());
        dto.setSupplierId(product.getSupplierId());
        return dto;
    }
}