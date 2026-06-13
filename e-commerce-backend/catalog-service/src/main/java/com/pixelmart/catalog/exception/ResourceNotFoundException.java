package com.pixelmart.catalog.exception;

public class ResourceNotFoundException extends CatalogException {

    public ResourceNotFoundException(String resource, String id) {
        super(404, "Not Found", resource + " not found: " + id);
    }
}
