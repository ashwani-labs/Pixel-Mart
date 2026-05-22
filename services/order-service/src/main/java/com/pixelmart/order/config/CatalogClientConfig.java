package com.pixelmart.order.config;

import com.pixelmart.order.client.CatalogClientProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(CatalogClientProperties.class)
public class CatalogClientConfig {
}
