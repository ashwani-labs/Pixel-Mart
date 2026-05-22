package com.pixelmart.catalog.service;

import com.pixelmart.catalog.domain.Product;
import com.pixelmart.catalog.dto.ProductRequests.CreateProductRequest;
import com.pixelmart.catalog.dto.ProductRequests.UpdateProductRequest;
import com.pixelmart.catalog.dto.ProductRequests.UpdateProductVisibilityRequest;
import com.pixelmart.catalog.dto.InternalProductResponse;
import com.pixelmart.catalog.dto.ProductDetailResponse;
import com.pixelmart.catalog.dto.ProductResponse;
import com.pixelmart.catalog.exception.ConflictException;
import com.pixelmart.catalog.exception.ResourceNotFoundException;
import com.pixelmart.catalog.repository.CategoryRepository;
import com.pixelmart.catalog.repository.ProductRepository;
import com.pixelmart.catalog.util.SlugUtil;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductImageService productImageService;
    private final AuditLogService auditLogService;

    public ProductService(
            ProductRepository productRepository,
            CategoryRepository categoryRepository,
            @Lazy ProductImageService productImageService,
            AuditLogService auditLogService
    ) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.productImageService = productImageService;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> listPublic(String categoryId, String search, Pageable pageable) {
        return productRepository.findPublicProducts(normalize(categoryId), normalize(search), pageable)
                .map(ProductResponse::fromPublic);
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> listFeatured(Pageable pageable) {
        return productRepository.findByVisibleTrueAndFeaturedTrue(pageable)
                .map(ProductResponse::fromPublic);
    }

    @Transactional(readOnly = true)
    public InternalProductResponse getInternalById(String id) {
        return InternalProductResponse.from(findProduct(id));
    }

    @Transactional(readOnly = true)
    public ProductDetailResponse getPublicBySlug(String slug) {
        Product product = productRepository.findBySlugAndVisibleTrue(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Product", slug));
        return ProductDetailResponse.fromPublic(
                product,
                productImageService.listForProductPublic(product.getId())
        );
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> listAdmin(String categoryId, String search, Pageable pageable) {
        return productRepository.findAdminProducts(normalize(categoryId), normalize(search), pageable)
                .map(ProductResponse::from);
    }

    @Transactional(readOnly = true)
    public ProductResponse getAdminById(String id) {
        return ProductResponse.from(findProduct(id));
    }

    @Transactional
    public ProductResponse create(CreateProductRequest request) {
        validateCategory(request.categoryId());
        String slug = resolveSlug(request.slug(), request.name(), null);
        Product product = mapProduct(new Product(), request, slug);
        return ProductResponse.from(productRepository.save(product));
    }

    @Transactional
    public ProductResponse update(String id, UpdateProductRequest request) {
        validateCategory(request.categoryId());
        Product product = findProduct(id);
        Map<String, Object> before = priceSnapshot(product);
        String slug = resolveSlug(request.slug(), request.name(), id);
        mapProduct(product, request, slug);
        Product saved = productRepository.save(product);
        Map<String, Object> after = priceSnapshot(saved);
        if (!before.equals(after)) {
            auditLogService.log("PRODUCT_PRICE_UPDATED", "product", id, before, after);
        }
        return ProductResponse.from(saved);
    }

    @Transactional
    public ProductResponse updateVisibility(String id, UpdateProductVisibilityRequest request) {
        Product product = findProduct(id);
        boolean oldVisible = product.isVisible();
        product.setVisible(request.visible());
        Product saved = productRepository.save(product);
        if (oldVisible != saved.isVisible()) {
            auditLogService.log(
                    "PRODUCT_VISIBILITY_UPDATED",
                    "product",
                    id,
                    Map.of("visible", oldVisible),
                    Map.of("visible", saved.isVisible())
            );
        }
        return ProductResponse.from(saved);
    }

    @Transactional
    public void delete(String id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product", id);
        }
        productRepository.deleteById(id);
    }

    private Product mapProduct(Product product, CreateProductRequest request, String slug) {
        product.setCategoryId(request.categoryId());
        product.setName(request.name().trim());
        product.setSlug(slug);
        product.setDescription(request.description());
        product.setBasePrice(request.basePrice());
        product.setCompareAtPrice(request.compareAtPrice());
        product.setStockQty(request.stockQty());
        product.setVisible(request.visible());
        product.setFeatured(request.featured());
        return product;
    }

    private Product mapProduct(Product product, UpdateProductRequest request, String slug) {
        product.setCategoryId(request.categoryId());
        product.setName(request.name().trim());
        product.setSlug(slug);
        product.setDescription(request.description());
        product.setBasePrice(request.basePrice());
        product.setCompareAtPrice(request.compareAtPrice());
        product.setStockQty(request.stockQty());
        product.setVisible(request.visible());
        product.setFeatured(request.featured());
        return product;
    }

    private void validateCategory(String categoryId) {
        if (!categoryRepository.existsById(categoryId)) {
            throw new ResourceNotFoundException("Category", categoryId);
        }
    }

    Product findProduct(String id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
    }

    private String resolveSlug(String requestedSlug, String name, String excludeId) {
        String base = (requestedSlug == null || requestedSlug.isBlank())
                ? SlugUtil.toSlug(name)
                : SlugUtil.toSlug(requestedSlug);
        String slug = base;
        int suffix = 1;
        while (productRepository.findBySlug(slug)
                .map(p -> excludeId == null || !p.getId().equals(excludeId))
                .orElse(false)) {
            slug = base + "-" + suffix++;
        }
        return slug;
    }

    private String normalize(String value) {
        return (value == null || value.isBlank()) ? null : value.trim();
    }

    private Map<String, Object> priceSnapshot(Product product) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("basePrice", product.getBasePrice());
        map.put("compareAtPrice", product.getCompareAtPrice());
        return map;
    }
}
