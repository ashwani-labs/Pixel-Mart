package com.pixelmart.catalog.service;

import com.pixelmart.catalog.domain.Category;
import com.pixelmart.catalog.domain.Product;
import com.pixelmart.catalog.dto.SearchSuggestResponse;
import com.pixelmart.catalog.dto.SearchSuggestResponse.SearchSuggestItem;
import com.pixelmart.catalog.repository.CategoryRepository;
import com.pixelmart.catalog.repository.ProductRepository;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SearchSuggestService {

  private final ProductRepository productRepository;
  private final CategoryRepository categoryRepository;
  private final SearchEventService searchEventService;

  public SearchSuggestService(
      ProductRepository productRepository,
      CategoryRepository categoryRepository,
      SearchEventService searchEventService) {
    this.productRepository = productRepository;
    this.categoryRepository = categoryRepository;
    this.searchEventService = searchEventService;
  }

  @Transactional
  public SearchSuggestResponse suggest(String query, String sessionId) {
    if (query == null || query.trim().length() < 2) {
      return new SearchSuggestResponse(List.of(), List.of());
    }
    String term = query.trim();
    List<SearchSuggestItem> products =
        productRepository.suggestVisibleByName(term, PageRequest.of(0, 5)).stream()
            .map(this::toProductItem)
            .toList();
    List<SearchSuggestItem> categories =
        categoryRepository
            .findByActiveTrueAndNameContainingIgnoreCaseOrderBySortOrderAscNameAsc(
                term, PageRequest.of(0, 4))
            .stream()
            .map(this::toCategoryItem)
            .toList();
    searchEventService.logSearch(term, products.size() + categories.size(), sessionId);
    return new SearchSuggestResponse(products, categories);
  }

  private SearchSuggestItem toProductItem(Product product) {
    return new SearchSuggestItem(product.getId(), product.getName(), product.getSlug(), "product");
  }

  private SearchSuggestItem toCategoryItem(Category category) {
    return new SearchSuggestItem(
        category.getId(), category.getName(), category.getSlug(), "category");
  }
}
