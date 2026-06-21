package com.pixelmart.order.dto;

import java.math.BigDecimal;

public record CouponRedemptionStat(String couponCode, long redemptions, BigDecimal discountTotal) {}
