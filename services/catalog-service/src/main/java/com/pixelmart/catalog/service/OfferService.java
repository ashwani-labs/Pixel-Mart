package com.pixelmart.catalog.service;

import com.pixelmart.catalog.domain.Offer;
import com.pixelmart.catalog.domain.OfferScope;
import com.pixelmart.catalog.domain.OfferType;
import com.pixelmart.catalog.domain.Product;
import com.pixelmart.catalog.dto.OfferRequests.CreateOfferRequest;
import com.pixelmart.catalog.dto.OfferRequests.UpdateOfferRequest;
import com.pixelmart.catalog.dto.OfferResponse;
import com.pixelmart.catalog.exception.BadRequestException;
import com.pixelmart.catalog.exception.ResourceNotFoundException;
import com.pixelmart.catalog.repository.CategoryRepository;
import com.pixelmart.catalog.repository.OfferRepository;
import com.pixelmart.catalog.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class OfferService {

    private static final BigDecimal ONE_HUNDRED = BigDecimal.valueOf(100);

    private final OfferRepository offerRepository;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final AuditLogService auditLogService;

    public OfferService(
            OfferRepository offerRepository,
            ProductRepository productRepository,
            CategoryRepository categoryRepository,
            AuditLogService auditLogService
    ) {
        this.offerRepository = offerRepository;
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public Page<OfferResponse> listAdmin(Pageable pageable) {
        return offerRepository.findAllByOrderByCreatedAtDesc(pageable).map(OfferResponse::from);
    }

    @Transactional(readOnly = true)
    public List<OfferResponse> listActiveAutomatic() {
        return offerRepository.findActiveAutomaticOffers(Instant.now()).stream()
                .map(OfferResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public OfferPricing price(Product product) {
        return price(product, null);
    }

    @Transactional(readOnly = true)
    public OfferPricing price(Product product, String couponCode) {
        String normalizedCoupon = normalizeCoupon(couponCode);
        List<Offer> offers = offerRepository.findActiveProductOffers(
                product.getId(),
                product.getCategoryId(),
                normalizedCoupon,
                Instant.now()
        );
        boolean couponMatched = normalizedCoupon != null && offers.stream()
                .anyMatch(offer -> normalizedCoupon.equalsIgnoreCase(offer.getCouponCode()));
        return bestPrice(product, offers, couponMatched);
    }

    @Transactional
    public OfferResponse create(CreateOfferRequest request) {
        Offer offer = apply(new Offer(), request);
        Offer saved = offerRepository.save(offer);
        auditLogService.log("OFFER_CREATED", "offer", saved.getId(), null, snapshot(saved));
        return OfferResponse.from(saved);
    }

    @Transactional
    public OfferResponse update(String id, UpdateOfferRequest request) {
        Offer offer = findOffer(id);
        Map<String, Object> before = snapshot(offer);
        apply(offer, request);
        Offer saved = offerRepository.save(offer);
        auditLogService.log("OFFER_UPDATED", "offer", id, before, snapshot(saved));
        return OfferResponse.from(saved);
    }

    @Transactional
    public void delete(String id) {
        Offer offer = findOffer(id);
        auditLogService.log("OFFER_DELETED", "offer", id, snapshot(offer), null);
        offerRepository.delete(offer);
    }

    private Offer apply(Offer offer, CreateOfferRequest request) {
        offer.setName(request.name().trim());
        offer.setType(request.type());
        offer.setScope(request.scope());
        offer.setProductId(normalize(request.productId()));
        offer.setCategoryId(normalize(request.categoryId()));
        offer.setValue(request.value().setScale(2, RoundingMode.HALF_UP));
        offer.setStartsAt(request.startsAt());
        offer.setEndsAt(request.endsAt());
        offer.setCouponCode(normalizeCoupon(request.couponCode()));
        offer.setActive(request.active() == null || request.active());
        validateOffer(offer);
        return offer;
    }

    private Offer apply(Offer offer, UpdateOfferRequest request) {
        offer.setName(request.name().trim());
        offer.setType(request.type());
        offer.setScope(request.scope());
        offer.setProductId(normalize(request.productId()));
        offer.setCategoryId(normalize(request.categoryId()));
        offer.setValue(request.value().setScale(2, RoundingMode.HALF_UP));
        offer.setStartsAt(request.startsAt());
        offer.setEndsAt(request.endsAt());
        offer.setCouponCode(normalizeCoupon(request.couponCode()));
        offer.setActive(request.active() == null || request.active());
        validateOffer(offer);
        return offer;
    }

    private void validateOffer(Offer offer) {
        if (offer.getType() == OfferType.PERCENT && offer.getValue().compareTo(ONE_HUNDRED) > 0) {
            throw new BadRequestException("Percent offers cannot exceed 100");
        }
        if (offer.getEndsAt() != null && !offer.getEndsAt().isAfter(offer.getStartsAt())) {
            throw new BadRequestException("Offer end time must be after start time");
        }
        if (offer.getScope() == OfferScope.PRODUCT) {
            if (offer.getProductId() == null) {
                throw new BadRequestException("Product offers require productId");
            }
            if (!productRepository.existsById(offer.getProductId())) {
                throw new ResourceNotFoundException("Product", offer.getProductId());
            }
            offer.setCategoryId(null);
            return;
        }
        if (offer.getScope() == OfferScope.CATEGORY) {
            if (offer.getCategoryId() == null) {
                throw new BadRequestException("Category offers require categoryId");
            }
            if (!categoryRepository.existsById(offer.getCategoryId())) {
                throw new ResourceNotFoundException("Category", offer.getCategoryId());
            }
            offer.setProductId(null);
            return;
        }
        offer.setProductId(null);
        offer.setCategoryId(null);
    }

    @Transactional(readOnly = true)
    public CartOfferPricing cartDiscount(BigDecimal subtotal, String couponCode) {
        String normalizedCoupon = normalizeCoupon(couponCode);
        BigDecimal normalizedSubtotal = subtotal.setScale(2, RoundingMode.HALF_UP);
        List<Offer> offers = offerRepository.findActiveCartOffers(normalizedCoupon, Instant.now());
        boolean couponMatched = normalizedCoupon != null && offers.stream()
                .anyMatch(offer -> normalizedCoupon.equalsIgnoreCase(offer.getCouponCode()));

        Offer best = offers.stream()
                .max(Comparator.comparing(offer -> cartDiscountAmount(normalizedSubtotal, offer)))
                .orElse(null);
        if (best == null) {
            return new CartOfferPricing(BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP), null, null, couponMatched);
        }

        BigDecimal discountTotal = cartDiscountAmount(normalizedSubtotal, best);
        if (discountTotal.compareTo(BigDecimal.ZERO) <= 0) {
            return new CartOfferPricing(BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP), null, null, couponMatched);
        }
        return new CartOfferPricing(
                discountTotal,
                best.getName(),
                best.getCouponCode(),
                couponMatched
        );
    }

    private BigDecimal cartDiscountAmount(BigDecimal subtotal, Offer offer) {
        BigDecimal discount = switch (offer.getType()) {
            case PERCENT -> subtotal.multiply(offer.getValue())
                    .divide(ONE_HUNDRED, 2, RoundingMode.HALF_UP);
            case FIXED -> offer.getValue().min(subtotal);
        };
        return discount.max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
    }

    private OfferPricing bestPrice(Product product, List<Offer> offers, boolean couponMatched) {
        BigDecimal basePrice = product.getBasePrice().setScale(2, RoundingMode.HALF_UP);
        OfferCandidate best = offers.stream()
                .map(offer -> new OfferCandidate(offer, discountedPrice(basePrice, offer)))
                .min(Comparator.comparing(OfferCandidate::price))
                .orElse(null);

        if (best == null || best.price().compareTo(basePrice) >= 0) {
            return new OfferPricing(basePrice, product.getCompareAtPrice(), null, null, couponMatched);
        }

        String appliedCoupon = best.offer().getCouponCode();
        BigDecimal compareAtPrice = product.getCompareAtPrice() != null
                && product.getCompareAtPrice().compareTo(basePrice) > 0
                ? product.getCompareAtPrice()
                : basePrice;
        return new OfferPricing(
                best.price(),
                compareAtPrice,
                best.offer().getName(),
                appliedCoupon,
                couponMatched
        );
    }

    private BigDecimal discountedPrice(BigDecimal basePrice, Offer offer) {
        BigDecimal discounted = switch (offer.getType()) {
            case PERCENT -> basePrice.subtract(
                    basePrice.multiply(offer.getValue())
                            .divide(ONE_HUNDRED, 2, RoundingMode.HALF_UP)
            );
            case FIXED -> basePrice.subtract(offer.getValue());
        };
        return discounted.max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
    }

    private Offer findOffer(String id) {
        return offerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Offer", id));
    }

    private String normalize(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private String normalizeCoupon(String value) {
        String normalized = normalize(value);
        return normalized == null ? null : normalized.toUpperCase();
    }

    private Map<String, Object> snapshot(Offer offer) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("name", offer.getName());
        map.put("type", offer.getType());
        map.put("scope", offer.getScope());
        map.put("productId", offer.getProductId());
        map.put("categoryId", offer.getCategoryId());
        map.put("value", offer.getValue());
        map.put("startsAt", offer.getStartsAt());
        map.put("endsAt", offer.getEndsAt());
        map.put("couponCode", offer.getCouponCode());
        map.put("active", offer.isActive());
        return map;
    }

    private record OfferCandidate(Offer offer, BigDecimal price) {
    }
}
