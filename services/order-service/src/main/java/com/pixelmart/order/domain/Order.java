package com.pixelmart.order.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @Column(length = 36, nullable = false)
    private String id;

    @Column(name = "order_number", nullable = false, unique = true, length = 32)
    private String orderNumber;

    @Column(name = "user_id", length = 36, nullable = false)
    private String userId;

    @Column(name = "address_id", length = 36, nullable = false)
    private String addressId;

    @Column(nullable = false, length = 32)
    private String status;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal subtotal;

    @Column(name = "tax_total", nullable = false, precision = 12, scale = 2)
    private BigDecimal taxTotal;

    @Column(name = "grand_total", nullable = false, precision = 12, scale = 2)
    private BigDecimal grandTotal;

    @Column(name = "tax_label", nullable = false, length = 64)
    private String taxLabel;

    @Column(name = "tax_rate_percent", nullable = false, precision = 5, scale = 2)
    private BigDecimal taxRatePercent;

    @Column(name = "payment_method", nullable = false, length = 32)
    private String paymentMethod;

    @Column(name = "payment_status", nullable = false, length = 32)
    private String paymentStatus;

    @Column(name = "ship_to_name", nullable = false)
    private String shipToName;

    @Column(name = "ship_to_phone", nullable = false, length = 20)
    private String shipToPhone;

    @Column(name = "ship_address_line1", nullable = false)
    private String shipAddressLine1;

    @Column(name = "ship_address_line2")
    private String shipAddressLine2;

    @Column(name = "ship_city", nullable = false, length = 128)
    private String shipCity;

    @Column(name = "ship_state", nullable = false, length = 128)
    private String shipState;

    @Column(name = "ship_pincode", nullable = false, length = 6)
    private String shipPincode;

    @Column(name = "ship_country", nullable = false, length = 64)
    private String shipCountry;

    @Column(name = "ship_post_office_name")
    private String shipPostOfficeName;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
        Instant now = Instant.now();
        if (createdAt == null) {
            createdAt = now;
        }
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }

    public String getId() {
        return id;
    }

    public String getOrderNumber() {
        return orderNumber;
    }

    public void setOrderNumber(String orderNumber) {
        this.orderNumber = orderNumber;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getAddressId() {
        return addressId;
    }

    public void setAddressId(String addressId) {
        this.addressId = addressId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public BigDecimal getTaxTotal() {
        return taxTotal;
    }

    public void setTaxTotal(BigDecimal taxTotal) {
        this.taxTotal = taxTotal;
    }

    public BigDecimal getGrandTotal() {
        return grandTotal;
    }

    public void setGrandTotal(BigDecimal grandTotal) {
        this.grandTotal = grandTotal;
    }

    public String getTaxLabel() {
        return taxLabel;
    }

    public void setTaxLabel(String taxLabel) {
        this.taxLabel = taxLabel;
    }

    public BigDecimal getTaxRatePercent() {
        return taxRatePercent;
    }

    public void setTaxRatePercent(BigDecimal taxRatePercent) {
        this.taxRatePercent = taxRatePercent;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public String getShipToName() {
        return shipToName;
    }

    public void setShipToName(String shipToName) {
        this.shipToName = shipToName;
    }

    public String getShipToPhone() {
        return shipToPhone;
    }

    public void setShipToPhone(String shipToPhone) {
        this.shipToPhone = shipToPhone;
    }

    public String getShipAddressLine1() {
        return shipAddressLine1;
    }

    public void setShipAddressLine1(String shipAddressLine1) {
        this.shipAddressLine1 = shipAddressLine1;
    }

    public String getShipAddressLine2() {
        return shipAddressLine2;
    }

    public void setShipAddressLine2(String shipAddressLine2) {
        this.shipAddressLine2 = shipAddressLine2;
    }

    public String getShipCity() {
        return shipCity;
    }

    public void setShipCity(String shipCity) {
        this.shipCity = shipCity;
    }

    public String getShipState() {
        return shipState;
    }

    public void setShipState(String shipState) {
        this.shipState = shipState;
    }

    public String getShipPincode() {
        return shipPincode;
    }

    public void setShipPincode(String shipPincode) {
        this.shipPincode = shipPincode;
    }

    public String getShipCountry() {
        return shipCountry;
    }

    public void setShipCountry(String shipCountry) {
        this.shipCountry = shipCountry;
    }

    public String getShipPostOfficeName() {
        return shipPostOfficeName;
    }

    public void setShipPostOfficeName(String shipPostOfficeName) {
        this.shipPostOfficeName = shipPostOfficeName;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
