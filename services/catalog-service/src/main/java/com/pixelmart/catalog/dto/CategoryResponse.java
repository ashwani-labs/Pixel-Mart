package com.pixelmart.catalog.dto;

import com.pixelmart.catalog.domain.Category;

public record CategoryResponse(
        String id,
        String name,
        String slug,
        String parentId,
        int sortOrder,
        boolean active
) {
    public static CategoryResponse from(Category category) {
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getSlug(),
                category.getParentId(),
                category.getSortOrder(),
                category.isActive()
        );
    }
}
