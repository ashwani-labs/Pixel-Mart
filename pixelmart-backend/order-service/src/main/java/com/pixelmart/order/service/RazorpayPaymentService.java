package com.pixelmart.order.service;

import com.pixelmart.order.config.RazorpayProperties;
import com.pixelmart.order.exception.BadRequestException;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import java.math.BigDecimal;
import java.math.RoundingMode;
import org.json.JSONObject;
import org.springframework.stereotype.Service;

@Service
public class RazorpayPaymentService {

  private final RazorpayProperties properties;

  public RazorpayPaymentService(RazorpayProperties properties) {
    this.properties = properties;
  }

  public boolean isEnabled() {
    return properties.isEnabled();
  }

  public String keyId() {
    return properties.keyId();
  }

  public RazorpayCheckout createCheckoutOrder(String receipt, BigDecimal amountInr) {
    if (!isEnabled()) {
      throw new BadRequestException("Razorpay is not configured");
    }
    try {
      RazorpayClient client = new RazorpayClient(properties.keyId(), properties.keySecret());
      JSONObject options = new JSONObject();
      options.put("amount", toPaise(amountInr));
      options.put("currency", "INR");
      options.put("receipt", receipt);
      Order order = client.orders.create(options);
      return new RazorpayCheckout(properties.keyId(), order.get("id"), toPaise(amountInr), "INR");
    } catch (RazorpayException ex) {
      throw new BadRequestException("Could not create Razorpay order: " + ex.getMessage());
    }
  }

  public void verifySignature(String razorpayOrderId, String razorpayPaymentId, String signature) {
    if (!isEnabled()) {
      throw new BadRequestException("Razorpay is not configured");
    }
    try {
      JSONObject payload = new JSONObject();
      payload.put("razorpay_order_id", razorpayOrderId);
      payload.put("razorpay_payment_id", razorpayPaymentId);
      payload.put("razorpay_signature", signature);
      if (!Utils.verifyPaymentSignature(payload, properties.keySecret())) {
        throw new BadRequestException("Invalid Razorpay payment signature");
      }
    } catch (RazorpayException ex) {
      throw new BadRequestException("Could not verify Razorpay payment");
    }
  }

  private static long toPaise(BigDecimal amountInr) {
    return amountInr.multiply(BigDecimal.valueOf(100)).setScale(0, RoundingMode.HALF_UP).longValueExact();
  }

  public record RazorpayCheckout(String keyId, String razorpayOrderId, long amountPaise, String currency) {}
}
