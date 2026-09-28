package com.zycus.stockpulse.service;

import com.zycus.stockpulse.domain.Product;
import com.zycus.stockpulse.domain.enums.Category;

public interface CategoryAnalyticsService {
    double getCategoryAverageDemandVelocity(Category category);
    boolean isDemandSpike(Product product);
}