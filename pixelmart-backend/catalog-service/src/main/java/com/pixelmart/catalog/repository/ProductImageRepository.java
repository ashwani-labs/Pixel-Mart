package com.pixelmart.catalog.repository;

import com.pixelmart.catalog.domain.ProductImage;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductImageRepository extends JpaRepository<ProductImage, String> {

  List<ProductImage> findByProductIdOrderBySortOrderAsc(String productId);

  int countByProductId(String productId);
}
