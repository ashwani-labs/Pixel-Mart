package com.pixelmart.catalog.service;

import com.pixelmart.catalog.domain.Category;
import com.pixelmart.catalog.domain.Product;
import com.pixelmart.catalog.dto.SearchSuggestResponse;
import com.pixelmart.catalog.dto.SearchSuggestResponse.SearchSuggestItem;
import com.pixelmart.catalog.repository.CategoryRepository;
import com.pixelmart.catalog.repository.ProductRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SearchSuggestService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public SearchSuggestService(ProductRepository productRepository, CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    @Transactional(readOnly = true)
    public SearchSuggestResponse suggest(String query) {
        if (query == null || query.trim().length() < 2) {
            return new SearchSuggestResponse(List.of(), List.of());
        }
        String term = query.trim();
        List<SearchSuggestItem> products = productRepository
                .suggestVisibleByName(term, PageRequest.of(0, 5))
                .stream()
                .map(this::toProductItem)
                .toList();
        List<SearchSuggestItem> categories = categoryRepository
                .findByActiveTrueAndNameContainingIgnoreCaseOrderBySortOrderAscNameAsc(
                        term,
                        PageRequest.of(0, 4)
                )
                .stream()
                .map(this::toCategoryItem)
                .toList();
        return new SearchSuggestResponse(products, categories);
    }

    private SearchSuggestItem toProductItem(Product product) {
        return new SearchSuggestItem(product.getId(), product.getName(), product.getSlug(), "product");
    }

    private SearchSuggestItem toCategoryItem(Category category) {
        return new SearchSuggestItem(category.getId(), category.getName(), category.getSlug(), "category");
    }
}
