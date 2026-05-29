package com.pixelmart.catalog.service;

import com.pixelmart.catalog.domain.Product;
import com.pixelmart.catalog.dto.AdminCatalogDashboardResponse;
import com.pixelmart.catalog.dto.ProductResponse;
import com.pixelmart.catalog.repository.ProductRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminDashboardService {

    public static final int LOW_STOCK_THRESHOLD = 5;

    private final ProductRepository productRepository;

    public AdminDashboardService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public AdminCatalogDashboardResponse catalogStats() {
        long lowStockCount = productRepository.countByStockQtyLessThanEqual(LOW_STOCK_THRESHOLD);
        List<ProductResponse> lowStockProducts = productRepository
                .findByStockQtyLessThanEqualOrderByStockQtyAscNameAsc(
                        LOW_STOCK_THRESHOLD,
                        PageRequest.of(0, 8)
                )
                .stream()
                .map(ProductResponse::from)
                .toList();
        return new AdminCatalogDashboardResponse(LOW_STOCK_THRESHOLD, lowStockCount, lowStockProducts);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> listLowStock() {
        return productRepository
                .findByStockQtyLessThanEqualOrderByStockQtyAscNameAsc(
                        LOW_STOCK_THRESHOLD,
                        PageRequest.of(0, 50)
                )
                .stream()
                .map(ProductResponse::from)
                .toList();
    }
}
