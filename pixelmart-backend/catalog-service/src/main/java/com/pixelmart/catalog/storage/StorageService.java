package com.pixelmart.catalog.storage;

import java.nio.file.Path;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface StorageService {

  StoredObject store(String relativePath, MultipartFile file);

  StoredContent load(String storageKey);

  Path resolve(String storageKey);

  void delete(String storageKey);

  record StoredObject(String storageKey, String contentType) {}

  record StoredContent(Resource resource, String contentType) {}
}
