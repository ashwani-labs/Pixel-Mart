package com.pixelmart.order.exception;

public class ResourceNotFoundException extends OrderException {

    public ResourceNotFoundException(String resource, String id) {
        super(404, "Not Found", resource + " not found: " + id);
    }
}
