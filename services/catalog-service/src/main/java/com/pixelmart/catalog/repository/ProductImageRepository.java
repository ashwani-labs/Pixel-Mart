package com.pixelmart.catalog.repository;

import com.pixelmart.catalog.domain.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductImageRepository extends JpaRepository<ProductImage, String> {

    List<ProductImage> findByProductIdOrderBySortOrderAsc(String productId);

    int countByProductId(String productId);
}
