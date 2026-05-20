package com.pixelmart.catalog.controller;

import com.pixelmart.catalog.dto.CategoryResponse;
import com.pixelmart.catalog.dto.PageResponse;
import com.pixelmart.catalog.dto.ProductResponse;
import com.pixelmart.catalog.service.CategoryService;
import com.pixelmart.catalog.service.ProductService;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/catalog")
public class PublicCatalogController {

    private final CategoryService categoryService;
    private final ProductService productService;

    public PublicCatalogController(CategoryService categoryService, ProductService productService) {
        this.categoryService = categoryService;
        this.productService = productService;
    }

    @GetMapping("/categories")
    public List<CategoryResponse> categories() {
        return categoryService.listPublic();
    }

    @GetMapping("/products")
    public PageResponse<ProductResponse> products(
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean featured,
            @PageableDefault(size = 12, sort = "name", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        if (Boolean.TRUE.equals(featured)) {
            return PageResponse.from(productService.listFeatured(pageable));
        }
        return PageResponse.from(productService.listPublic(categoryId, search, pageable));
    }

    @GetMapping("/products/{slug}")
    public ProductResponse productBySlug(@PathVariable String slug) {
        return productService.getPublicBySlug(slug);
    }
}
