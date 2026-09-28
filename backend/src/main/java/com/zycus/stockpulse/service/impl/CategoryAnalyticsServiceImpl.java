package com.zycus.stockpulse.service.impl;

import com.zycus.stockpulse.domain.Product;
import com.zycus.stockpulse.domain.enums.Category;
import com.zycus.stockpulse.repository.ProductRepository;
import com.zycus.stockpulse.service.CategoryAnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CategoryAnalyticsServiceImpl implements CategoryAnalyticsService {
    
    @Autowired
    private ProductRepository productRepository;
    
    @Override
    public double getCategoryAverageDemandVelocity(Category category) {
        List<Product> products = productRepository.findByCategory(category);
        if (products.isEmpty()) {
            return 0.0;
        }
        
        int totalVelocity = products.stream()
            .mapToInt(Product::getDemandVelocity)
            .sum();
            
        return (double) totalVelocity / products.size();
    }
    
    @Override
    public boolean isDemandSpike(Product product) {
        double categoryAvg = getCategoryAverageDemandVelocity(product.getCategory());
        // Demand spike if velocity is 3x category average or more
        return product.getDemandVelocity() >= (3 * categoryAvg);
    }
}