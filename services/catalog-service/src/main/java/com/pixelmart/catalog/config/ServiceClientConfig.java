package com.pixelmart.catalog.config;

import com.pixelmart.catalog.client.AuthClientProperties;
import com.pixelmart.catalog.client.OrderClientProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties({
        OrderClientProperties.class,
        AuthClientProperties.class
})
public class ServiceClientConfig {
}
