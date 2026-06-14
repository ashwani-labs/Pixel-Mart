package com.pixelmart.catalog.storage;

import com.pixelmart.catalog.exception.BadRequestException;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

import java.io.IOException;
import java.nio.file.Path;
import java.util.Set;
import java.util.UUID;

@Service
@ConditionalOnProperty(name = "pixelmart.storage.type", havingValue = "s3")
public class S3StorageService implements StorageService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/gif"
    );

    private final S3Client s3Client;
    private final StorageProperties properties;

    public S3StorageService(S3Client s3Client, StorageProperties properties) {
        this.s3Client = s3Client;
        this.properties = properties;
        if (properties.getS3().getBucket() == null || properties.getS3().getBucket().isBlank()) {
            throw new IllegalStateException("pixelmart.storage.s3.bucket is required when storage type is s3");
        }
    }

    @Override
    public StoredObject store(String relativePath, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File is required");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new BadRequestException("Unsupported image type. Use JPEG, PNG, WebP, or GIF.");
        }
        String storageKey = relativePath + "/" + UUID.randomUUID() + extensionFor(contentType);
        String objectKey = objectKey(storageKey);
        try {
            PutObjectRequest request = PutObjectRequest.builder()
                    .bucket(bucket())
                    .key(objectKey)
                    .contentType(contentType)
                    .build();
            s3Client.putObject(request, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
            return new StoredObject(storageKey, contentType);
        } catch (IOException | S3Exception ex) {
            throw new BadRequestException("Failed to store file in S3: " + ex.getMessage());
        }
    }

    @Override
    public StoredContent load(String storageKey) {
        try {
            var response = s3Client.getObject(GetObjectRequest.builder()
                    .bucket(bucket())
                    .key(objectKey(storageKey))
                    .build());
            String contentType = response.response().contentType();
            if (contentType == null || contentType.isBlank()) {
                contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
            }
            Resource resource = new InputStreamResource(response);
            return new StoredContent(resource, contentType);
        } catch (NoSuchKeyException ex) {
            throw new BadRequestException("Media not found");
        } catch (S3Exception ex) {
            throw new BadRequestException("Failed to load file from S3: " + ex.getMessage());
        }
    }

    @Override
    public Path resolve(String storageKey) {
        throw new BadRequestException("S3 storage does not support local path resolution");
    }

    @Override
    public void delete(String storageKey) {
        try {
            s3Client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(bucket())
                    .key(objectKey(storageKey))
                    .build());
        } catch (S3Exception ex) {
            throw new BadRequestException("Failed to delete file from S3: " + ex.getMessage());
        }
    }

    private String bucket() {
        return properties.getS3().getBucket();
    }

    private String objectKey(String storageKey) {
        String prefix = properties.getS3().getPrefix();
        if (prefix == null || prefix.isBlank()) {
            return storageKey;
        }
        return prefix.replaceAll("/+$", "") + "/" + storageKey.replaceAll("^/+", "");
    }

    private static String extensionFor(String contentType) {
        return switch (contentType) {
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            case "image/gif" -> ".gif";
            default -> ".jpg";
        };
    }
}
