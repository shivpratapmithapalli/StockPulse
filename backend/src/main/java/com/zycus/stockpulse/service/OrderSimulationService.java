package com.zycus.stockpulse.service;

import com.zycus.stockpulse.domain.Product;
import com.zycus.stockpulse.dto.OrderSimulationRequest;

public interface OrderSimulationService {
    Product simulateOrder(String productId, OrderSimulationRequest request);
}