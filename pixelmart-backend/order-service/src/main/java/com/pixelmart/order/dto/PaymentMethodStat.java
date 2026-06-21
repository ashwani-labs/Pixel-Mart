package com.pixelmart.order.dto;

import java.math.BigDecimal;

public record PaymentMethodStat(String method, long orderCount, BigDecimal revenue) {}
