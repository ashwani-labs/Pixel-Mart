package com.pixelmart.catalog.config;

import com.pixelmart.catalog.storage.StorageProperties;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

@Configuration
@ConditionalOnProperty(name = "pixelmart.storage.type", havingValue = "s3")
public class S3StorageConfig {

    @Bean
    S3Client s3Client(StorageProperties properties) {
        return S3Client.builder()
                .region(Region.of(properties.getS3().getRegion()))
                .build();
    }
}
