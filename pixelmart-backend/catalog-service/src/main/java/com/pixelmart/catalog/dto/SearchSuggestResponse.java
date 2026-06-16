package com.pixelmart.catalog.dto;

import java.util.List;

public record SearchSuggestResponse(
        List<SearchSuggestItem> products,
        List<SearchSuggestItem> categories
) {
    public record SearchSuggestItem(
            String id,
            String label,
            String slug,
            String type
    ) {
    }
}
