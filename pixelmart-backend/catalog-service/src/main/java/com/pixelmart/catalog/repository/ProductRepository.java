package com.pixelmart.catalog.repository;

import com.pixelmart.catalog.domain.Product;
import jakarta.persistence.LockModeType;
import java.math.BigDecimal;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductRepository extends JpaRepository<Product, String> {

  boolean existsBySlug(String slug);

  Optional<Product> findBySlug(String slug);

  Optional<Product> findBySlugAndVisibleTrue(String slug);

  @Query(
      """
            SELECT p FROM Product p
            WHERE p.visible = true
              AND (:categoryId IS NULL OR p.categoryId = :categoryId)
              AND (:superCategoryId IS NULL OR p.categoryId IN (
                  SELECT c.id FROM Category c WHERE c.parentId = :superCategoryId
              ))
              AND (:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%')))
              AND (:minPrice IS NULL OR p.basePrice >= :minPrice)
              AND (:maxPrice IS NULL OR p.basePrice <= :maxPrice)
              AND (:inStockOnly IS NULL OR :inStockOnly = false OR p.stockQty > 0)
              AND (:onSaleOnly IS NULL OR :onSaleOnly = false
                   OR (p.compareAtPrice IS NOT NULL AND p.compareAtPrice > p.basePrice))
            """)
  Page<Product> findPublicProducts(
      @Param("categoryId") String categoryId,
      @Param("superCategoryId") String superCategoryId,
      @Param("search") String search,
      @Param("minPrice") BigDecimal minPrice,
      @Param("maxPrice") BigDecimal maxPrice,
      @Param("inStockOnly") Boolean inStockOnly,
      @Param("onSaleOnly") Boolean onSaleOnly,
      Pageable pageable);

  @Query(
      """
            SELECT p FROM Product p
            WHERE p.visible = true
              AND LOWER(p.name) LIKE LOWER(CONCAT('%', :q, '%'))
            ORDER BY p.name ASC
            """)
  List<Product> suggestVisibleByName(@Param("q") String q, Pageable pageable);

  @Query(
      """
            SELECT p FROM Product p
            WHERE (:categoryId IS NULL OR p.categoryId = :categoryId)
              AND (:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')))
            """)
  Page<Product> findAdminProducts(
      @Param("categoryId") String categoryId, @Param("search") String search, Pageable pageable);

  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("SELECT p FROM Product p WHERE p.id IN :ids")
  List<Product> findAllByIdForUpdate(@Param("ids") Collection<String> ids);

  Page<Product> findByVisibleTrueAndFeaturedTrue(Pageable pageable);

  List<Product> findByIdInAndVisibleTrue(Collection<String> ids);

  long countByCategoryId(String categoryId);

  long countByStockQtyLessThanEqual(int stockQty);

  List<Product> findByStockQtyLessThanEqualOrderByStockQtyAscNameAsc(
      int stockQty, Pageable pageable);
}
