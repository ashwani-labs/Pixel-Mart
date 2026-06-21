package com.pixelmart.catalog.service;

import com.pixelmart.catalog.domain.Product;
import com.pixelmart.catalog.domain.ProductVariant;
import com.pixelmart.catalog.dto.BulkStockRequests.BulkStockLine;
import com.pixelmart.catalog.dto.BulkStockRequests.BulkStockUpdateRequest;
import com.pixelmart.catalog.dto.InternalProductResponse;
import com.pixelmart.catalog.dto.InternalStockRequests.ReserveStockLine;
import com.pixelmart.catalog.dto.InternalStockRequests.ReserveStockRequest;
import com.pixelmart.catalog.dto.ProductDetailResponse;
import com.pixelmart.catalog.dto.ProductRequests.CreateProductRequest;
import com.pixelmart.catalog.dto.ProductRequests.UpdateProductRequest;
import com.pixelmart.catalog.dto.ProductRequests.UpdateProductVisibilityRequest;
import com.pixelmart.catalog.dto.ProductResponse;
import com.pixelmart.catalog.dto.ProductVariantResponse;
import com.pixelmart.catalog.exception.BadRequestException;
import com.pixelmart.catalog.exception.ResourceNotFoundException;
import com.pixelmart.catalog.repository.ProductRepository;
import com.pixelmart.catalog.repository.ProductVariantRepository;
import com.pixelmart.catalog.util.SlugUtil;
import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProductService {

  private final ProductRepository productRepository;
  private final ProductVariantRepository productVariantRepository;
  private final CategoryService categoryService;
  private final ProductImageService productImageService;
  private final AuditLogService auditLogService;
  private final OfferService offerService;
  private final AnalyticsEventService analyticsEventService;
  private final SearchEventService searchEventService;

  public ProductService(
      ProductRepository productRepository,
      ProductVariantRepository productVariantRepository,
      CategoryService categoryService,
      @Lazy ProductImageService productImageService,
      AuditLogService auditLogService,
      @Lazy OfferService offerService,
      AnalyticsEventService analyticsEventService,
      SearchEventService searchEventService) {
    this.productRepository = productRepository;
    this.productVariantRepository = productVariantRepository;
    this.categoryService = categoryService;
    this.productImageService = productImageService;
    this.auditLogService = auditLogService;
    this.offerService = offerService;
    this.analyticsEventService = analyticsEventService;
    this.searchEventService = searchEventService;
  }

  @Transactional(readOnly = true)
  public Page<ProductResponse> listPublic(
      String categoryId,
      String superCategoryId,
      String search,
      BigDecimal minPrice,
      BigDecimal maxPrice,
      Boolean inStockOnly,
      Boolean onSaleOnly,
      Integer minRating,
      Pageable pageable) {
    Page<ProductResponse> page =
        productRepository
            .findPublicProducts(
                normalize(categoryId),
                normalize(superCategoryId),
                normalize(search),
                minPrice,
                maxPrice,
                inStockOnly,
                onSaleOnly,
                minRating,
                pageable)
            .map(product -> ProductResponse.fromPublic(product, offerService.price(product)));
    if (search != null && !search.isBlank()) {
      searchEventService.logSearch(search, (int) page.getTotalElements(), null);
    }
    return page;
  }

  @Transactional(readOnly = true)
  public Page<ProductResponse> listFeatured(Pageable pageable) {
    return productRepository
        .findByVisibleTrueAndFeaturedTrue(pageable)
        .map(product -> ProductResponse.fromPublic(product, offerService.price(product)));
  }

  @Transactional(readOnly = true)
  public List<ProductResponse> listPublicByIds(List<String> idsInOrder) {
    if (idsInOrder == null || idsInOrder.isEmpty()) {
      return List.of();
    }
    Map<String, Product> productsById =
        productRepository.findByIdInAndVisibleTrue(idsInOrder).stream()
            .collect(Collectors.toMap(Product::getId, Function.identity()));
    return idsInOrder.stream()
        .map(productsById::get)
        .filter(product -> product != null)
        .map(product -> ProductResponse.fromPublic(product, offerService.price(product)))
        .toList();
  }

  @Transactional(readOnly = true)
  public InternalProductResponse getInternalById(String id, String variantId, String couponCode) {
    Product product = findProduct(id);
    ProductVariant variant = resolveActiveVariant(id, variantId);
    return InternalProductResponse.from(product, offerService.price(product, couponCode), variant);
  }

  @Transactional
  public void reserveStock(ReserveStockRequest request) {
    Map<String, Integer> productQty = new LinkedHashMap<>();
    Map<String, Integer> variantQty = new LinkedHashMap<>();
    for (ReserveStockLine line : request.items()) {
      if (line.variantId() != null && !line.variantId().isBlank()) {
        variantQty.merge(line.variantId(), line.quantity(), Integer::sum);
      } else {
        productQty.merge(line.productId(), line.quantity(), Integer::sum);
      }
    }

    if (!productQty.isEmpty()) {
      Map<String, Product> products =
          productRepository.findAllByIdForUpdate(productQty.keySet()).stream()
              .collect(Collectors.toMap(Product::getId, Function.identity()));
      for (Map.Entry<String, Integer> entry : productQty.entrySet()) {
        Product product = products.get(entry.getKey());
        if (product == null) {
          throw new ResourceNotFoundException("Product", entry.getKey());
        }
        if (!product.isVisible()) {
          throw new BadRequestException("Product is not available: " + product.getName());
        }
        if (product.getStockQty() < entry.getValue()) {
          throw new BadRequestException("Insufficient stock for " + product.getName());
        }
      }
      productQty.forEach(
          (productId, quantity) -> {
            Product product = products.get(productId);
            product.setStockQty(product.getStockQty() - quantity);
          });
    }

    if (!variantQty.isEmpty()) {
      Map<String, ProductVariant> variants =
          productVariantRepository.findAllByIdForUpdate(variantQty.keySet()).stream()
              .collect(Collectors.toMap(ProductVariant::getId, Function.identity()));
      for (Map.Entry<String, Integer> entry : variantQty.entrySet()) {
        ProductVariant variant = variants.get(entry.getKey());
        if (variant == null || !variant.isActive()) {
          throw new ResourceNotFoundException("ProductVariant", entry.getKey());
        }
        Product product = findProduct(variant.getProductId());
        if (!product.isVisible()) {
          throw new BadRequestException("Product is not available: " + product.getName());
        }
        if (variant.getStockQty() < entry.getValue()) {
          throw new BadRequestException("Insufficient stock for variant " + variant.getSku());
        }
      }
      variantQty.forEach(
          (variantId, quantity) -> {
            ProductVariant variant = variants.get(variantId);
            variant.setStockQty(variant.getStockQty() - quantity);
          });
    }
  }

  @Transactional
  public void bulkUpdateStock(BulkStockUpdateRequest request) {
    Map<String, Integer> updates =
        request.items().stream()
            .collect(
                Collectors.toMap(
                    BulkStockLine::productId,
                    BulkStockLine::stockQty,
                    (left, right) -> right,
                    LinkedHashMap::new));
    Map<String, Product> products =
        productRepository.findAllById(updates.keySet()).stream()
            .collect(Collectors.toMap(Product::getId, Function.identity()));
    for (Map.Entry<String, Integer> entry : updates.entrySet()) {
      Product product = products.get(entry.getKey());
      if (product == null) {
        throw new ResourceNotFoundException("Product", entry.getKey());
      }
      int oldQty = product.getStockQty();
      product.setStockQty(entry.getValue());
      if (oldQty != entry.getValue()) {
        auditLogService.log(
            "PRODUCT_STOCK_UPDATED",
            "product",
            product.getId(),
            Map.of("stockQty", oldQty),
            Map.of("stockQty", entry.getValue()));
      }
    }
  }

  @Transactional(readOnly = true)
  public ProductDetailResponse getPublicBySlug(String slug) {
    Product product =
        productRepository
            .findBySlugAndVisibleTrue(slug)
            .orElseThrow(() -> new ResourceNotFoundException("Product", slug));
    return ProductDetailResponse.fromPublic(
        product,
        offerService.price(product),
        analyticsEventService.parseHighlights(product),
        listVariants(product.getId()),
        productImageService.listForProductPublic(product.getId()));
  }

  private List<ProductVariantResponse> listVariants(String productId) {
    return productVariantRepository.findByProductIdAndActiveTrueOrderBySizeAscColorAsc(productId)
        .stream()
        .map(ProductVariantResponse::from)
        .toList();
  }

  private ProductVariant resolveActiveVariant(String productId, String variantId) {
    if (variantId == null || variantId.isBlank()) {
      return null;
    }
    return productVariantRepository
        .findByIdAndProductIdAndActiveTrue(variantId, productId)
        .orElseThrow(() -> new ResourceNotFoundException("ProductVariant", variantId));
  }

  @Transactional(readOnly = true)
  public Page<ProductResponse> listAdmin(String categoryId, String search, Pageable pageable) {
    return productRepository
        .findAdminProducts(normalize(categoryId), normalize(search), pageable)
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
    Product saved = productRepository.save(product);
    auditLogService.log("PRODUCT_CREATED", "product", saved.getId(), null, productSnapshot(saved));
    return ProductResponse.from(saved);
  }

  @Transactional
  public ProductResponse update(String id, UpdateProductRequest request) {
    validateCategory(request.categoryId());
    Product product = findProduct(id);
    Map<String, Object> before = productSnapshot(product);
    String slug = resolveSlug(request.slug(), request.name(), id);
    mapProduct(product, request, slug);
    Product saved = productRepository.save(product);
    Map<String, Object> after = productSnapshot(saved);
    if (!before.equals(after)) {
      auditLogService.log("PRODUCT_UPDATED", "product", id, before, after);
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
          Map.of("visible", saved.isVisible()));
    }
    return ProductResponse.from(saved);
  }

  @Transactional
  public void delete(String id) {
    Product product =
        productRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Product", id));
    auditLogService.log("PRODUCT_DELETED", "product", id, productSnapshot(product), null);
    productRepository.delete(product);
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
    product.setHighlightsJson(analyticsEventService.serializeHighlights(request.highlights()));
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
    product.setHighlightsJson(analyticsEventService.serializeHighlights(request.highlights()));
    return product;
  }

  private void validateCategory(String categoryId) {
    categoryService.validateProductCategory(categoryId);
  }

  Product findProduct(String id) {
    return productRepository
        .findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Product", id));
  }

  private String resolveSlug(String requestedSlug, String name, String excludeId) {
    String base =
        (requestedSlug == null || requestedSlug.isBlank())
            ? SlugUtil.toSlug(name)
            : SlugUtil.toSlug(requestedSlug);
    String slug = base;
    int suffix = 1;
    while (productRepository
        .findBySlug(slug)
        .map(p -> excludeId == null || !p.getId().equals(excludeId))
        .orElse(false)) {
      slug = base + "-" + suffix++;
    }
    return slug;
  }

  private String normalize(String value) {
    return (value == null || value.isBlank()) ? null : value.trim();
  }

  private Map<String, Object> productSnapshot(Product product) {
    Map<String, Object> map = new LinkedHashMap<>();
    map.put("name", product.getName());
    map.put("slug", product.getSlug());
    map.put("categoryId", product.getCategoryId());
    map.put("basePrice", product.getBasePrice());
    map.put("compareAtPrice", product.getCompareAtPrice());
    map.put("stockQty", product.getStockQty());
    map.put("visible", product.isVisible());
    map.put("featured", product.isFeatured());
    return map;
  }

  private Map<String, Object> priceSnapshot(Product product) {
    Map<String, Object> map = new LinkedHashMap<>();
    map.put("basePrice", product.getBasePrice());
    map.put("compareAtPrice", product.getCompareAtPrice());
    return map;
  }
}
