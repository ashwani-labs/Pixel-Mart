package com.pixelmart.catalog.controller;

import com.pixelmart.catalog.dto.PageResponse;
import com.pixelmart.catalog.dto.ProductRequests.CreateProductRequest;
import com.pixelmart.catalog.dto.ProductRequests.UpdateProductRequest;
import com.pixelmart.catalog.dto.ProductRequests.UpdateProductVisibilityRequest;
import com.pixelmart.catalog.dto.ProductResponse;
import com.pixelmart.catalog.dto.ProductImageResponse;
import com.pixelmart.catalog.service.ProductImageService;
import com.pixelmart.catalog.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/products")
@PreAuthorize("hasRole('ADMIN')")
public class AdminProductController {

    private final ProductService productService;
    private final ProductImageService productImageService;

    public AdminProductController(ProductService productService, ProductImageService productImageService) {
        this.productService = productService;
        this.productImageService = productImageService;
    }

    @GetMapping
    public PageResponse<ProductResponse> list(
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "name", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        return PageResponse.from(productService.listAdmin(categoryId, search, pageable));
    }

    @GetMapping("/{id}")
    public ProductResponse get(@PathVariable String id) {
        return productService.getAdminById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductResponse create(@Valid @RequestBody CreateProductRequest request) {
        return productService.create(request);
    }

    @PutMapping("/{id}")
    public ProductResponse update(@PathVariable String id, @Valid @RequestBody UpdateProductRequest request) {
        return productService.update(id, request);
    }

    @PatchMapping("/{id}/visibility")
    public ProductResponse updateVisibility(
            @PathVariable String id,
            @Valid @RequestBody UpdateProductVisibilityRequest request
    ) {
        return productService.updateVisibility(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        productService.delete(id);
    }

    @PostMapping(value = "/{id}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public ProductImageResponse uploadImage(
            @PathVariable String id,
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) String altText
    ) {
        return productImageService.upload(id, file, altText);
    }
}
