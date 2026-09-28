package com.zycus.stockpulse.event;

import com.zycus.stockpulse.domain.Product;
import java.time.Instant;

public class InventorySignalEvent {
    private final Product product;
    private final Instant timestamp;
    
    public InventorySignalEvent(Product product) {
        this.product = product;
        this.timestamp = Instant.now();
    }
    
    // Getters
    public Product getProduct() {
        return product;
    }
    
    public Instant getTimestamp() {
        return timestamp;
    }
}