package com.zycus.stockpulse.service.impl;

import com.zycus.stockpulse.domain.Product;
import com.zycus.stockpulse.domain.enums.Category;
import com.zycus.stockpulse.domain.enums.ProductStatus;
import com.zycus.stockpulse.dto.CreateProductRequest;
import com.zycus.stockpulse.dto.StockUpdateRequest;
import com.zycus.stockpulse.event.InventorySignalEvent;
import com.zycus.stockpulse.exception.ResourceNotFoundException;
import com.zycus.stockpulse.repository.ProductRepository;
import com.zycus.stockpulse.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class ProductServiceImpl implements ProductService {
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private ApplicationEventPublisher eventPublisher;
    
    @Override
    public Product createProduct(CreateProductRequest request) {
        Product product = new Product(
            request.getId(),
            request.getSku(),
            request.getName(),
            request.getCategory(),
            request.getCurrentPrice(),
            request.getStockLevel(),
            request.getReorderThreshold()
        );
        
        if (product.getStockLevel() == 0) {
            product.setStatus(ProductStatus.OUT_OF_STOCK);
        }
        
        return productRepository.save(product);
    }
    
    @Override
    public List<Product> getAllProducts(ProductStatus status, Category category) {
        if (status != null && category != null) {
            return productRepository.findByStatusAndCategory(status, category);
        } else if (status != null) {
            return productRepository.findByStatus(status);
        } else if (category != null) {
            return productRepository.findByCategory(category);
        } else {
            return productRepository.findAll();
        }
    }
    
    @Override
    public Product getProductById(String id) {
        return productRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));
    }
    
    @Override
    public Product updateProduct(String id, CreateProductRequest request) {
        Product product = getProductById(id);
        product.setSku(request.getSku());
        product.setName(request.getName());
        product.setCategory(request.getCategory());
        product.setCurrentPrice(request.getCurrentPrice());
        product.setStockLevel(request.getStockLevel());
        product.setReorderThreshold(request.getReorderThreshold());
        
        if (product.getStockLevel() == 0) {
            product.setStatus(ProductStatus.OUT_OF_STOCK);
        } else if (product.getStatus() == ProductStatus.OUT_OF_STOCK) {
            product.setStatus(ProductStatus.ACTIVE);
        }
        
        return productRepository.save(product);
    }
    
    @Override
    public Product updateStockLevel(String id, StockUpdateRequest request) {
        Product product = getProductById(id);
        product.setStockLevel(request.getStockLevel());
        
        if (product.getStockLevel() == 0) {
            product.setStatus(ProductStatus.OUT_OF_STOCK);
        } else if (product.getStatus() == ProductStatus.OUT_OF_STOCK) {
            product.setStatus(ProductStatus.ACTIVE);
        }
        
        Product savedProduct = productRepository.save(product);
        
        // Fire event for agentic loop
        eventPublisher.publishEvent(new InventorySignalEvent(savedProduct));
        
        return savedProduct;
    }
    
    @Override
    public void deleteProduct(String id) {
        productRepository.deleteById(id);
    }
}