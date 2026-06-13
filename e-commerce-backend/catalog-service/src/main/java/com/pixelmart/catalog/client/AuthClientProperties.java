package com.pixelmart.catalog.client;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "pixelmart.auth")
public class AuthClientProperties {

    private String baseUrl = "http://localhost:8081";
    private String internalServiceName = "catalog-service";

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
