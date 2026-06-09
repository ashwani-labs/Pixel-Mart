package com.pixelmart.catalog.storage;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;

public interface StorageService {

    StoredObject store(String relativePath, MultipartFile file);

    StoredContent load(String storageKey);

    Path resolve(String storageKey);

    void delete(String storageKey);

    record StoredObject(String storageKey, String contentType) {}

    record StoredContent(Resource resource, String contentType) {}
}
