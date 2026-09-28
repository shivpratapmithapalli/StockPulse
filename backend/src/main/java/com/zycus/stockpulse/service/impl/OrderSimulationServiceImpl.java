package com.zycus.stockpulse.service.impl;

import com.zycus.stockpulse.domain.Product;
import com.zycus.stockpulse.domain.enums.ProductStatus;
import com.zycus.stockpulse.dto.OrderSimulationRequest;
import com.zycus.stockpulse.event.InventorySignalEvent;
import com.zycus.stockpulse.exception.ResourceNotFoundException;
import com.zycus.stockpulse.repository.ProductRepository;
import com.zycus.stockpulse.service.OrderSimulationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class OrderSimulationServiceImpl implements OrderSimulationService {
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private ApplicationEventPublisher eventPublisher;
    
    @Override
    public Product simulateOrder(String productId, OrderSimulationRequest request) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + productId));
        
        int newStockLevel = product.getStockLevel() - request.getQuantity();
        if (newStockLevel < 0) {
            throw new IllegalArgumentException("Insufficient stock for order");
        }
        
        product.setStockLevel(newStockLevel);
        product.setDemandVelocity(product.getDemandVelocity() + request.getQuantity());
        
        if (product.getStockLevel() == 0) {
            product.setStatus(ProductStatus.OUT_OF_STOCK);
        }
        
        Product savedProduct = productRepository.save(product);
        
        // Fire event for agentic loop
        eventPublisher.publishEvent(new InventorySignalEvent(savedProduct));
        
        return savedProduct;
    }
}