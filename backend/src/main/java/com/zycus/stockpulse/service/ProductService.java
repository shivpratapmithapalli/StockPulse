package com.zycus.stockpulse.service;

import com.zycus.stockpulse.domain.Product;
import com.zycus.stockpulse.domain.enums.Category;
import com.zycus.stockpulse.domain.enums.ProductStatus;
import com.zycus.stockpulse.dto.CreateProductRequest;
import com.zycus.stockpulse.dto.StockUpdateRequest;
import java.util.List;

public interface ProductService {
    Product createProduct(CreateProductRequest request);
    List<Product> getAllProducts(ProductStatus status, Category category);
    Product getProductById(String id);
    Product updateProduct(String id, CreateProductRequest request);
    Product updateStockLevel(String id, StockUpdateRequest request);
    void deleteProduct(String id);
}