package com.pixelmart.notification.service;

import com.pixelmart.notification.dto.OrderConfirmationRequest;

import java.math.BigDecimal;

final class OrderConfirmationTemplate {

    private OrderConfirmationTemplate() {
    }

    static String subject(String orderNumber) {
        return "Order confirmed — " + orderNumber;
    }

    static String html(OrderConfirmationRequest request) {
        String currency = request.currencyCode() == null || request.currencyCode().isBlank()
                ? "INR"
                : request.currencyCode();
        StringBuilder rows = new StringBuilder();
        for (OrderConfirmationRequest.OrderLine line : request.items()) {
            rows.append("""
                    <tr>
                      <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;">%s</td>
                      <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;text-align:center;">%d</td>
                      <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;text-align:right;">%s</td>
                    </tr>
                    """.formatted(
                    escape(line.productName()),
                    line.quantity(),
                    formatMoney(line.lineTotal(), currency)
            ));
        }
        return """
                <!DOCTYPE html>
                <html>
                <body style="font-family:Segoe UI,Arial,sans-serif;background:#f8fafc;color:#0f172a;margin:0;padding:24px;">
                  <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:24px;">
                    <p style="margin:0 0 8px;color:#6366f1;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;font-size:12px;">PixelMart</p>
                    <h1 style="margin:0 0 12px;font-size:24px;">Thanks for your order, %s!</h1>
                    <p style="margin:0 0 20px;color:#475569;">Order <strong>%s</strong> is <strong>%s</strong>.</p>
                    <table style="width:100%%;border-collapse:collapse;margin-bottom:20px;">
                      <thead>
                        <tr>
                          <th style="text-align:left;padding-bottom:8px;color:#64748b;font-size:12px;">Item</th>
                          <th style="text-align:center;padding-bottom:8px;color:#64748b;font-size:12px;">Qty</th>
                          <th style="text-align:right;padding-bottom:8px;color:#64748b;font-size:12px;">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        %s
                      </tbody>
                    </table>
                    <p style="margin:0;font-size:18px;font-weight:700;text-align:right;">Grand total: %s</p>
                  </div>
                </body>
                </html>
                """.formatted(
                escape(request.recipientName()),
                escape(request.orderNumber()),
                escape(request.status()),
                rows,
                formatMoney(request.grandTotal(), currency)
        );
    }

    private static String formatMoney(BigDecimal amount, String currency) {
        return amount.setScale(2, java.math.RoundingMode.HALF_UP) + " " + currency;
    }

    private static String escape(String value) {
        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }
}
