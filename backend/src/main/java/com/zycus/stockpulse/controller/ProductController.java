package com.zycus.stockpulse.controller;

import com.zycus.stockpulse.domain.Product;
import com.zycus.stockpulse.domain.enums.Category;
import com.zycus.stockpulse.domain.enums.ProductStatus;
import com.zycus.stockpulse.dto.*;
import com.zycus.stockpulse.service.MerchandisingService;
import com.zycus.stockpulse.service.OrderSimulationService;
import com.zycus.stockpulse.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/products")
@Validated
public class ProductController {
    
    @Autowired
    private ProductService productService;
    
    @Autowired
    private OrderSimulationService orderSimulationService;
    
    @Autowired
    private MerchandisingService merchandisingService;
    
    @GetMapping
    public ResponseEntity<List<ProductDTO>> getAllProducts(
            @RequestParam(required = false) ProductStatus status,
            @RequestParam(required = false) Category category) {
        List<Product> products = productService.getAllProducts(status, category);
        // Convert to DTOs
        List<ProductDTO> productDTOs = products.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(productDTOs);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> getProductById(@PathVariable String id) {
        Product product = productService.getProductById(id);
        return ResponseEntity.ok(convertToDTO(product));
    }
    
    @PostMapping
    public ResponseEntity<ProductDTO> createProduct(@Valid @RequestBody CreateProductRequest request) {
        Product product = productService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(product));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ProductDTO> updateProduct(@PathVariable String id, 
                                                   @Valid @RequestBody CreateProductRequest request) {
        Product product = productService.updateProduct(id, request);
        return ResponseEntity.ok(convertToDTO(product));
    }
    
    @PatchMapping("/{id}/stock")
    public ResponseEntity<ProductDTO> updateStockLevel(@PathVariable String id,
                                                      @Valid @RequestBody StockUpdateRequest request) {
        Product product = productService.updateStockLevel(id, request);
        return ResponseEntity.ok(convertToDTO(product));
    }
    
    @PostMapping("/{id}/orders")
    public ResponseEntity<ProductDTO> simulateOrder(@PathVariable String id,
                                                   @Valid @RequestBody OrderSimulationRequest request) {
        Product product = orderSimulationService.simulateOrder(id, request);
        return ResponseEntity.ok(convertToDTO(product));
    }
    
    @GetMapping("/{id}/suggestions")
    public ResponseEntity<SuggestionsBundleResponse> getProductSuggestions(@PathVariable String id) {
        SuggestionsBundleResponse response = merchandisingService.getProductSuggestions(id);
        return ResponseEntity.ok(response);
    }
    
    private ProductDTO convertToDTO(Product product) {
        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setSku(product.getSku());
        dto.setName(product.getName());
        dto.setCategory(product.getCategory());
        dto.setCurrentPrice(product.getCurrentPrice());
        dto.setStockLevel(product.getStockLevel());
        dto.setReorderThreshold(product.getReorderThreshold());
        dto.setDemandVelocity(product.getDemandVelocity());
        dto.setStatus(product.getStatus());
        dto.setCostPrice(product.getCostPrice());
        dto.setMarginFloor(product.getMarginFloor());
        dto.setSupplierId(product.getSupplierId());
        return dto;
    }
}