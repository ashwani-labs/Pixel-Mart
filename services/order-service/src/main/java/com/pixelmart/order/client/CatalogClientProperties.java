package com.pixelmart.order.client;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "pixelmart.catalog")
public class CatalogClientProperties {

    private String baseUrl = "http://localhost:8082";
    private String internalServiceName = "order-service";

    public String getBaseUrl() {
        return baseUrl;
    }

    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }

    public String getInternalServiceName() {
        return internalServiceName;
    }

    public void setInternalServiceName(String internalServiceName) {
        this.internalServiceName = internalServiceName;
    }
}
