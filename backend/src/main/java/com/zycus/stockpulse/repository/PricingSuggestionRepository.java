package com.zycus.stockpulse.repository;

import com.zycus.stockpulse.domain.Product;
import com.zycus.stockpulse.domain.PricingSuggestion;
import com.zycus.stockpulse.domain.enums.SuggestionStatus;
import com.zycus.stockpulse.domain.enums.TriggerReason;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PricingSuggestionRepository extends JpaRepository<PricingSuggestion, Long> {
    List<PricingSuggestion> findByProductId(String productId);
    List<PricingSuggestion> findByProductIdAndStatus(String productId, SuggestionStatus status);
    List<PricingSuggestion> findByStatus(SuggestionStatus status);
    
    List<PricingSuggestion> findByProductAndTriggerReasonAndStatus(
        Product product, TriggerReason triggerReason, SuggestionStatus status);
        
    boolean existsByProductAndTriggerReasonAndStatus(
        Product product, TriggerReason triggerReason, SuggestionStatus status);
}