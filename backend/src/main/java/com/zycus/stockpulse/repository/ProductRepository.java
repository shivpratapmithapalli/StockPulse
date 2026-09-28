package com.zycus.stockpulse.repository;

import com.zycus.stockpulse.domain.Product;
import com.zycus.stockpulse.domain.enums.Category;
import com.zycus.stockpulse.domain.enums.ProductStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, String> {
    List<Product> findByStatus(ProductStatus status);
    List<Product> findByCategory(Category category);
    List<Product> findByStatusAndCategory(ProductStatus status, Category category);
    
    @Query("SELECT DISTINCT p FROM Product p JOIN p.pricingSuggestions ps WHERE ps.status = 'PENDING'")
    List<Product> findProductsWithPendingPricingSuggestions();
    
    @Query("SELECT DISTINCT p FROM Product p JOIN p.reorderSuggestions rs WHERE rs.status = 'PENDING'")
    List<Product> findProductsWithPendingReorderSuggestions();
}