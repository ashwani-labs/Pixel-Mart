package com.pixelmart.catalog.service;

import com.pixelmart.catalog.domain.ProductImage;
import com.pixelmart.catalog.dto.ProductImageResponse;
import com.pixelmart.catalog.exception.BadRequestException;
import com.pixelmart.catalog.exception.ResourceNotFoundException;
import com.pixelmart.catalog.repository.ProductImageRepository;
import com.pixelmart.catalog.storage.StorageService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class ProductImageService {

    private final ProductImageRepository productImageRepository;
    private final ProductService productService;
    private final StorageService storageService;
    private final MediaUrlService mediaUrlService;

    public ProductImageService(
            ProductImageRepository productImageRepository,
            ProductService productService,
            StorageService storageService,
            MediaUrlService mediaUrlService
    ) {
        this.productImageRepository = productImageRepository;
        this.productService = productService;
        this.storageService = storageService;
        this.mediaUrlService = mediaUrlService;
    }

    @Transactional
    public ProductImageResponse upload(String productId, MultipartFile file, String altText) {
        productService.findProduct(productId);
        int sortOrder = productImageRepository.countByProductId(productId);
        StorageService.StoredObject stored = storageService.store("products/" + productId, file);
        ProductImage image = new ProductImage();
        image.setProductId(productId);
        image.setStorageKey(stored.storageKey());
        image.setAltText(altText);
        image.setSortOrder(sortOrder);
        ProductImage saved = productImageRepository.save(image);
        return ProductImageResponse.from(saved, mediaUrlService.productImageUrl(saved.getId()));
    }

    @Transactional(readOnly = true)
    public List<ProductImageResponse> listForProduct(String productId) {
        return productImageRepository.findByProductIdOrderBySortOrderAsc(productId).stream()
                .map(img -> ProductImageResponse.from(img, mediaUrlService.productImageUrl(img.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProductImageResponse> listForProductPublic(String productId) {
        return listForProduct(productId);
    }

    @Transactional(readOnly = true)
    public MediaResource getProductImage(String imageId) {
        ProductImage image = productImageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("ProductImage", imageId));
        return toMediaResource(image.getStorageKey());
    }

    @Transactional(readOnly = true)
    public MediaResource getBrandLogo(StoreSettingsService storeSettingsService) {
        var settings = storeSettingsService.findSettings();
        if (settings.getLogoStorageKey() == null) {
            throw new ResourceNotFoundException("BrandLogo", "default");
        }
        return toMediaResource(settings.getLogoStorageKey());
    }

    private MediaResource toMediaResource(String storageKey) {
        try {
            StorageService.StoredContent content = storageService.load(storageKey);
            return new MediaResource(content.resource(), content.contentType());
        } catch (BadRequestException ex) {
            throw new ResourceNotFoundException("Media", storageKey);
        }
    }

    public record MediaResource(org.springframework.core.io.Resource resource, String contentType) {}
}
