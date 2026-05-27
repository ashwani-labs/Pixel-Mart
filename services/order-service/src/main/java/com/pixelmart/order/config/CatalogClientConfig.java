package com.pixelmart.order.config;

import com.pixelmart.order.client.AuthClientProperties;
import com.pixelmart.order.client.CatalogClientProperties;
import com.pixelmart.order.client.NotificationClientProperties;
import com.pixelmart.order.client.PincodeClientProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties({
        CatalogClientProperties.class,
        PincodeClientProperties.class,
        AuthClientProperties.class,
        NotificationClientProperties.class
})
public class CatalogClientConfig {
}
