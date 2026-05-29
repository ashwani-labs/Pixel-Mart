package com.pixelmart.catalog.service;

import com.pixelmart.catalog.domain.Category;
import com.pixelmart.catalog.dto.CategoryRequests.CreateCategoryRequest;
import com.pixelmart.catalog.dto.CategoryRequests.UpdateCategoryRequest;
import com.pixelmart.catalog.dto.CategoryResponse;
import com.pixelmart.catalog.exception.ResourceNotFoundException;
import com.pixelmart.catalog.repository.CategoryRepository;
import com.pixelmart.catalog.util.SlugUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final AuditLogService auditLogService;

    public CategoryService(CategoryRepository categoryRepository, AuditLogService auditLogService) {
        this.categoryRepository = categoryRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> listPublic() {
        return categoryRepository.findByActiveTrueOrderBySortOrderAscNameAsc().stream()
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
        String slug = resolveSlug(request.slug(), request.name(), null);
        Category category = new Category();
        category.setName(request.name().trim());
        category.setSlug(slug);
        category.setParentId(request.parentId());
        category.setSortOrder(request.sortOrder());
        category.setActive(request.active());
        Category saved = categoryRepository.save(category);
        auditLogService.log("CATEGORY_CREATED", "category", saved.getId(), null, snapshot(saved));
        return CategoryResponse.from(saved);
    }

    @Transactional
    public CategoryResponse update(String id, UpdateCategoryRequest request) {
        Category category = findCategory(id);
        Map<String, Object> before = snapshot(category);
        String slug = resolveSlug(request.slug(), request.name(), id);
        category.setName(request.name().trim());
        category.setSlug(slug);
        category.setParentId(request.parentId());
        category.setSortOrder(request.sortOrder());
        category.setActive(request.active());
        Category saved = categoryRepository.save(category);
        auditLogService.log("CATEGORY_UPDATED", "category", id, before, snapshot(saved));
        return CategoryResponse.from(saved);
    }

    @Transactional
    public void delete(String id) {
        Category category = findCategory(id);
        auditLogService.log("CATEGORY_DELETED", "category", id, snapshot(category), null);
        categoryRepository.delete(category);
    }

    Category findCategory(String id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));
    }

    private String resolveSlug(String requestedSlug, String name, String excludeId) {
        String base = (requestedSlug == null || requestedSlug.isBlank())
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
        return categoryRepository.findBySlug(slug)
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
