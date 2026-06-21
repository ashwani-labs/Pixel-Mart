package com.pixelmart.catalog.service;

import com.pixelmart.catalog.domain.ReviewStatus;
import com.pixelmart.catalog.dto.AdminCatalogDashboardResponse;
import com.pixelmart.catalog.dto.ProductResponse;
import com.pixelmart.catalog.repository.ProductRepository;
import com.pixelmart.catalog.repository.ReviewRepository;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminDashboardService {

  public static final int LOW_STOCK_THRESHOLD = 5;

  private final ProductRepository productRepository;
  private final ReviewRepository reviewRepository;

  public AdminDashboardService(
      ProductRepository productRepository, ReviewRepository reviewRepository) {
    this.productRepository = productRepository;
    this.reviewRepository = reviewRepository;
  }

  @Transactional(readOnly = true)
  public AdminCatalogDashboardResponse catalogStats() {
    long lowStockCount = productRepository.countByStockQtyLessThanEqual(LOW_STOCK_THRESHOLD);
    List<ProductResponse> lowStockProducts =
        productRepository
            .findByStockQtyLessThanEqualOrderByStockQtyAscNameAsc(
                LOW_STOCK_THRESHOLD, PageRequest.of(0, 8))
            .stream()
            .map(ProductResponse::from)
            .toList();
    return new AdminCatalogDashboardResponse(
        LOW_STOCK_THRESHOLD,
        lowStockCount,
        lowStockProducts,
        reviewRepository.countByStatus(ReviewStatus.PENDING));
  }

  @Transactional(readOnly = true)
  public List<ProductResponse> listLowStock() {
    return productRepository
        .findByStockQtyLessThanEqualOrderByStockQtyAscNameAsc(
            LOW_STOCK_THRESHOLD, PageRequest.of(0, 50))
        .stream()
        .map(ProductResponse::from)
        .toList();
  }
}
