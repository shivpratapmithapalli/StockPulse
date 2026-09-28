package com.zycus.stockpulse.repository;

import com.zycus.stockpulse.domain.Product;
import com.zycus.stockpulse.domain.ReorderSuggestion;
import com.zycus.stockpulse.domain.enums.SuggestionStatus;
import com.zycus.stockpulse.domain.enums.TriggerReason;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReorderSuggestionRepository extends JpaRepository<ReorderSuggestion, Long> {
    List<ReorderSuggestion> findByProductId(String productId);
    List<ReorderSuggestion> findByProductIdAndStatus(String productId, SuggestionStatus status);
    List<ReorderSuggestion> findByStatus(SuggestionStatus status);
    
    List<ReorderSuggestion> findByProductAndTriggerReasonAndStatus(
        Product product, TriggerReason triggerReason, SuggestionStatus status);
        
    boolean existsByProductAndTriggerReasonAndStatus(
        Product product, TriggerReason triggerReason, SuggestionStatus status);
}