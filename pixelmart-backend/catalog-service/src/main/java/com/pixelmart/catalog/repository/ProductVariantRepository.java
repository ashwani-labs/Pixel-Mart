package com.pixelmart.catalog.repository;

import com.pixelmart.catalog.domain.ProductVariant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, String> {

  List<ProductVariant> findByProductIdAndActiveTrueOrderBySizeAscColorAsc(String productId);

  Optional<ProductVariant> findByIdAndProductIdAndActiveTrue(String id, String productId);

  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("SELECT v FROM ProductVariant v WHERE v.id IN :ids")
  List<ProductVariant> findAllByIdForUpdate(@Param("ids") Iterable<String> ids);
}
