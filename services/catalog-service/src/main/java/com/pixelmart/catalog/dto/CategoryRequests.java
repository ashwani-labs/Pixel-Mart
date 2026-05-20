package com.pixelmart.catalog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class CategoryRequests {

    private CategoryRequests() {
    }

    public record CreateCategoryRequest(
            @NotBlank @Size(max = 255) String name,
            @Size(max = 255) String slug,
            String parentId,
            int sortOrder,
            boolean active
    ) {
    }

    public record UpdateCategoryRequest(
            @NotBlank @Size(max = 255) String name,
            @Size(max = 255) String slug,
            String parentId,
            int sortOrder,
            boolean active
    ) {
    }
}
