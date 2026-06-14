package com.pixelmart.order.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "pincode_cache")
public class PincodeCache {

    @Id
    @Column(length = 6, nullable = false)
    private String pincode;

    @Column(name = "payload_json", nullable = false, length = 16_384)
    private String payloadJson;

    @Column(name = "cached_at", nullable = false)
    private Instant cachedAt;

    public String getPincode() {
        return pincode;
    }

    public void setPincode(String pincode) {
        this.pincode = pincode;
    }

    public String getPayloadJson() {
        return payloadJson;
    }

    public void setPayloadJson(String payloadJson) {
        this.payloadJson = payloadJson;
    }

    public Instant getCachedAt() {
        return cachedAt;
    }

    public void setCachedAt(Instant cachedAt) {
        this.cachedAt = cachedAt;
    }
}
