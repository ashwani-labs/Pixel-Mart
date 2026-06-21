package com.pixelmart.catalog.service;

import com.pixelmart.catalog.client.OrderClient;
import com.pixelmart.catalog.domain.AnalyticsEventType;
import com.pixelmart.catalog.domain.ReviewStatus;
import com.pixelmart.catalog.dto.AdminCatalogDashboardResponse;
import com.pixelmart.catalog.dto.FunnelStats;
import com.pixelmart.catalog.dto.ProductResponse;
import com.pixelmart.catalog.dto.SearchTermStat;
import com.pixelmart.catalog.repository.AnalyticsEventRepository;
import com.pixelmart.catalog.repository.ProductRepository;
import com.pixelmart.catalog.repository.ReviewRepository;
import com.pixelmart.catalog.repository.SearchEventRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminDashboardService {

  public static final int LOW_STOCK_THRESHOLD = 5;
  private static final int FUNNEL_DAYS = 7;

  private final ProductRepository productRepository;
  private final ReviewRepository reviewRepository;
  private final SearchEventRepository searchEventRepository;
  private final AnalyticsEventRepository analyticsEventRepository;
  private final OrderClient orderClient;

  public AdminDashboardService(
      ProductRepository productRepository,
      ReviewRepository reviewRepository,
      SearchEventRepository searchEventRepository,
      AnalyticsEventRepository analyticsEventRepository,
      OrderClient orderClient) {
    this.productRepository = productRepository;
    this.reviewRepository = reviewRepository;
    this.searchEventRepository = searchEventRepository;
    this.analyticsEventRepository = analyticsEventRepository;
    this.orderClient = orderClient;
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
    Instant since =
        LocalDate.now(ZoneOffset.UTC).minusDays(FUNNEL_DAYS - 1L).atStartOfDay().toInstant(ZoneOffset.UTC);
    List<SearchTermStat> topSearchTerms =
        searchEventRepository.topTermsSince(since, 8).stream()
            .map(row -> new SearchTermStat(String.valueOf(row[0]), ((Number) row[1]).longValue()))
            .toList();
    FunnelStats funnelStats =
        new FunnelStats(
            analyticsEventRepository.countByEventTypeSince(
                AnalyticsEventType.PRODUCT_VIEW.name(), since),
            analyticsEventRepository.countByEventTypeSince(
                AnalyticsEventType.ADD_TO_CART.name(), since),
            analyticsEventRepository.countByEventTypeSince(
                AnalyticsEventType.CHECKOUT_START.name(), since),
            orderClient.countOrdersSince(since));
    return new AdminCatalogDashboardResponse(
        LOW_STOCK_THRESHOLD,
        lowStockCount,
        lowStockProducts,
        reviewRepository.countByStatus(ReviewStatus.PENDING),
        topSearchTerms,
        funnelStats);
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
