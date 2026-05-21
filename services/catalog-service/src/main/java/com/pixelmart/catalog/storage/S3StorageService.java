package com.pixelmart.catalog.storage;

import com.pixelmart.catalog.exception.BadRequestException;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;

/**
 * Placeholder for future S3 integration. Enable with {@code pixelmart.storage.type=s3}.
 */
@Service
@ConditionalOnProperty(name = "pixelmart.storage.type", havingValue = "s3")
public class S3StorageService implements StorageService {

    @Override
    public StoredObject store(String relativePath, MultipartFile file) {
        throw new BadRequestException("S3 storage is not configured yet. Use pixelmart.storage.type=local.");
    }

    @Override
    public Path resolve(String storageKey) {
        throw new BadRequestException("S3 storage is not configured yet.");
    }

    @Override
    public void delete(String storageKey) {
        throw new BadRequestException("S3 storage is not configured yet.");
    }
}
