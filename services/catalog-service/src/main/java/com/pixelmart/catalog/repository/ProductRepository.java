package com.pixelmart.catalog.repository;

import com.pixelmart.catalog.domain.Product;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, String> {

    boolean existsBySlug(String slug);

    Optional<Product> findBySlug(String slug);

    Optional<Product> findBySlugAndVisibleTrue(String slug);

    @Query("""
            SELECT p FROM Product p
            WHERE p.visible = true
              AND (:categoryId IS NULL OR p.categoryId = :categoryId)
              AND (:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%')))
            """)
    Page<Product> findPublicProducts(
            @Param("categoryId") String categoryId,
            @Param("search") String search,
            Pageable pageable
    );

    @Query("""
            SELECT p FROM Product p
            WHERE (:categoryId IS NULL OR p.categoryId = :categoryId)
              AND (:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')))
            """)
    Page<Product> findAdminProducts(
            @Param("categoryId") String categoryId,
            @Param("search") String search,
            Pageable pageable
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Product p WHERE p.id IN :ids")
    List<Product> findAllByIdForUpdate(@Param("ids") Collection<String> ids);

    Page<Product> findByVisibleTrueAndFeaturedTrue(Pageable pageable);

    List<Product> findByIdInAndVisibleTrue(Collection<String> ids);
}
