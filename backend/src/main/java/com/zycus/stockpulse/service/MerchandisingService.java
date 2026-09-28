package com.zycus.stockpulse.service;

import com.zycus.stockpulse.domain.Product;
import com.zycus.stockpulse.dto.SuggestionsBundleResponse;
import java.util.List;

public interface MerchandisingService {
    List<Product> getPendingProducts();
    SuggestionsBundleResponse getProductSuggestions(String productId);
    void processPricingSuggestion(Long suggestionId, String action);
    void processReorderSuggestion(Long suggestionId, String action);
}