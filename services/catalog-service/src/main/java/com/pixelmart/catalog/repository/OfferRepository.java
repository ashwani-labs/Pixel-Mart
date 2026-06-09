package com.pixelmart.catalog.repository;

import com.pixelmart.catalog.domain.Offer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface OfferRepository extends JpaRepository<Offer, String> {

    Page<Offer> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("""
            SELECT o FROM Offer o
            WHERE o.active = true
              AND o.startsAt <= :now
              AND (o.endsAt IS NULL OR o.endsAt >= :now)
              AND o.couponCode IS NULL
            ORDER BY o.startsAt DESC
            """)
    List<Offer> findActiveAutomaticOffers(@Param("now") Instant now);

    @Query("""
            SELECT o FROM Offer o
            WHERE o.active = true
              AND o.startsAt <= :now
              AND (o.endsAt IS NULL OR o.endsAt >= :now)
              AND ((o.scope = com.pixelmart.catalog.domain.OfferScope.PRODUCT AND o.productId = :productId)
                   OR (o.scope = com.pixelmart.catalog.domain.OfferScope.CATEGORY AND o.categoryId = :categoryId))
              AND (o.couponCode IS NULL
                   OR (:couponCode IS NOT NULL AND UPPER(o.couponCode) = UPPER(:couponCode)))
            """)
    List<Offer> findActiveProductOffers(
            @Param("productId") String productId,
            @Param("categoryId") String categoryId,
            @Param("couponCode") String couponCode,
            @Param("now") Instant now
    );

    @Query("""
            SELECT o FROM Offer o
            WHERE o.active = true
              AND o.startsAt <= :now
              AND (o.endsAt IS NULL OR o.endsAt >= :now)
              AND o.scope = com.pixelmart.catalog.domain.OfferScope.CART
              AND (o.couponCode IS NULL
                   OR (:couponCode IS NOT NULL AND UPPER(o.couponCode) = UPPER(:couponCode)))
            """)
    List<Offer> findActiveCartOffers(
            @Param("couponCode") String couponCode,
            @Param("now") Instant now
    );
}
