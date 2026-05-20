package com.pixelmart.catalog.service;

import com.pixelmart.catalog.domain.Category;
import com.pixelmart.catalog.dto.CategoryRequests.CreateCategoryRequest;
import com.pixelmart.catalog.dto.CategoryRequests.UpdateCategoryRequest;
import com.pixelmart.catalog.dto.CategoryResponse;
import com.pixelmart.catalog.exception.ConflictException;
import com.pixelmart.catalog.exception.ResourceNotFoundException;
import com.pixelmart.catalog.repository.CategoryRepository;
import com.pixelmart.catalog.util.SlugUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
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
        return CategoryResponse.from(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponse update(String id, UpdateCategoryRequest request) {
        Category category = findCategory(id);
        String slug = resolveSlug(request.slug(), request.name(), id);
        category.setName(request.name().trim());
        category.setSlug(slug);
        category.setParentId(request.parentId());
        category.setSortOrder(request.sortOrder());
        category.setActive(request.active());
        return CategoryResponse.from(categoryRepository.save(category));
    }

    @Transactional
    public void delete(String id) {
        if (!categoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Category", id);
        }
        categoryRepository.deleteById(id);
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
}
