package com.pixelmart.catalog.dto;

import java.util.List;

public record AdminCatalogDashboardResponse(
        int lowStockThreshold,
        long lowStockCount,
        List<ProductResponse> lowStockProducts
) {
}
