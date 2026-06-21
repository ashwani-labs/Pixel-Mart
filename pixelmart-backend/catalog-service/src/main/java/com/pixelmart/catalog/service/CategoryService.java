package com.pixelmart.catalog.service;

import com.pixelmart.catalog.domain.Category;
import com.pixelmart.catalog.dto.CategoryRequests.CreateCategoryRequest;
import com.pixelmart.catalog.dto.CategoryRequests.UpdateCategoryRequest;
import com.pixelmart.catalog.dto.CategoryResponse;
import com.pixelmart.catalog.exception.BadRequestException;
import com.pixelmart.catalog.exception.ResourceNotFoundException;
import com.pixelmart.catalog.repository.CategoryRepository;
import com.pixelmart.catalog.repository.ProductRepository;
import com.pixelmart.catalog.util.SlugUtil;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CategoryService {

  private final CategoryRepository categoryRepository;
  private final ProductRepository productRepository;
  private final AuditLogService auditLogService;

  public CategoryService(
      CategoryRepository categoryRepository,
      ProductRepository productRepository,
      AuditLogService auditLogService) {
    this.categoryRepository = categoryRepository;
    this.productRepository = productRepository;
    this.auditLogService = auditLogService;
  }

  @Transactional(readOnly = true)
  public List<CategoryResponse> listPublicSuperCategories() {
    return categoryRepository.findByParentIdIsNullAndActiveTrueOrderBySortOrderAscNameAsc().stream()
        .map(CategoryResponse::from)
        .toList();
  }

  @Transactional(readOnly = true)
  public List<CategoryResponse> listPublic() {
    return categoryRepository
        .findByParentIdIsNotNullAndActiveTrueOrderBySortOrderAscNameAsc()
        .stream()
        .map(CategoryResponse::from)
        .toList();
  }

  @Transactional(readOnly = true)
  public List<CategoryResponse> listAdmin() {
    return categoryRepository.findAllByOrderBySortOrderAscNameAsc().stream()
        .map(CategoryResponse::from)
        .toList();
  }

  @Transactional(readOnly = true)
  public CategoryResponse getById(String id) {
    return CategoryResponse.from(findCategory(id));
  }

  @Transactional
  public CategoryResponse create(CreateCategoryRequest request) {
    validateHierarchy(null, request.parentId());
    String slug = resolveSlug(request.slug(), request.name(), null);
    Category category = new Category();
    category.setName(request.name().trim());
    category.setSlug(slug);
    category.setParentId(normalizeParentId(request.parentId()));
    category.setSortOrder(request.sortOrder());
    category.setActive(request.active());
    Category saved = categoryRepository.save(category);
    auditLogService.log("CATEGORY_CREATED", "category", saved.getId(), null, snapshot(saved));
    return CategoryResponse.from(saved);
  }

  @Transactional
  public CategoryResponse update(String id, UpdateCategoryRequest request) {
    validateHierarchy(id, request.parentId());
    Category category = findCategory(id);
    Map<String, Object> before = snapshot(category);
    String slug = resolveSlug(request.slug(), request.name(), id);
    category.setName(request.name().trim());
    category.setSlug(slug);
    category.setParentId(normalizeParentId(request.parentId()));
    category.setSortOrder(request.sortOrder());
    category.setActive(request.active());
    Category saved = categoryRepository.save(category);
    auditLogService.log("CATEGORY_UPDATED", "category", id, before, snapshot(saved));
    return CategoryResponse.from(saved);
  }

  @Transactional
  public void delete(String id) {
    Category category = findCategory(id);
    if (category.getParentId() == null && categoryRepository.countByParentId(id) > 0) {
      throw new BadRequestException("Cannot delete a super category that has sub-categories");
    }
    if (productRepository.countByCategoryId(id) > 0) {
      throw new BadRequestException("Cannot delete a category that has products");
    }
    auditLogService.log("CATEGORY_DELETED", "category", id, snapshot(category), null);
    categoryRepository.delete(category);
  }

  Category findCategory(String id) {
    return categoryRepository
        .findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Category", id));
  }

  void validateProductCategory(String categoryId) {
    Category category = findCategory(categoryId);
    if (category.getParentId() == null || category.getParentId().isBlank()) {
      throw new BadRequestException(
          "Products must be assigned to a category under a super category");
    }
  }

  private void validateHierarchy(String categoryId, String parentId) {
    String normalizedParent = normalizeParentId(parentId);

    if (normalizedParent == null) {
      if (categoryId != null && categoryRepository.countByParentId(categoryId) > 0) {
        throw new BadRequestException(
            "Super categories with sub-categories cannot be nested under another category");
      }
      return;
    }

    if (categoryId != null && categoryId.equals(normalizedParent)) {
      throw new BadRequestException("Category cannot be its own parent");
    }

    Category parent = findCategory(normalizedParent);
    if (parent.getParentId() != null) {
      throw new BadRequestException("Parent must be a super category");
    }

    if (categoryId != null && categoryRepository.countByParentId(categoryId) > 0) {
      throw new BadRequestException(
          "Super categories with sub-categories cannot be nested under another category");
    }
  }

  private String normalizeParentId(String parentId) {
    return (parentId == null || parentId.isBlank()) ? null : parentId.trim();
  }

  private String resolveSlug(String requestedSlug, String name, String excludeId) {
    String base =
        (requestedSlug == null || requestedSlug.isBlank())
            ? SlugUtil.toSlug(name)
            : SlugUtil.toSlug(requestedSlug);
    String slug = base;
    int suffix = 1;
    while (slugTaken(slug, excludeId)) {
      slug = base + "-" + suffix++;
    }
    return slug;
  }

  private boolean slugTaken(String slug, String excludeId) {
    return categoryRepository
        .findBySlug(slug)
        .map(c -> excludeId == null || !c.getId().equals(excludeId))
        .orElse(false);
  }

  private Map<String, Object> snapshot(Category category) {
    Map<String, Object> map = new LinkedHashMap<>();
    map.put("name", category.getName());
    map.put("slug", category.getSlug());
    map.put("parentId", category.getParentId());
    map.put("sortOrder", category.getSortOrder());
    map.put("active", category.isActive());
    return map;
  }
}
