package com.pixelmart.order.service;

import com.pixelmart.order.dto.CheckoutDtos.PaymentMethod;
import com.pixelmart.order.exception.BadRequestException;
import java.math.BigDecimal;

public final class OrderShippingCalculator {

  public static final BigDecimal FREE_DELIVERY_THRESHOLD = new BigDecimal("499");
  public static final BigDecimal STANDARD_SHIPPING_FEE = new BigDecimal("49");
  public static final BigDecimal COD_MAX_ORDER_TOTAL = new BigDecimal("2000");

  private OrderShippingCalculator() {}

  public static BigDecimal shippingFee(BigDecimal subtotalAfterDiscount) {
    if (subtotalAfterDiscount.compareTo(FREE_DELIVERY_THRESHOLD) >= 0) {
      return BigDecimal.ZERO;
    }
    return STANDARD_SHIPPING_FEE;
  }

  public static void validateCodPayment(BigDecimal grandTotal, PaymentMethod paymentMethod) {
    if (paymentMethod != PaymentMethod.MOCK_COD) {
      return;
    }
    if (grandTotal.compareTo(COD_MAX_ORDER_TOTAL) > 0) {
      throw new BadRequestException("Cash on delivery is available for orders up to ₹2000");
    }
  }
}
