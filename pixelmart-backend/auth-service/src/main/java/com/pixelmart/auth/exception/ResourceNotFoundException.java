package com.pixelmart.auth.exception;

public class ResourceNotFoundException extends AuthException {

    public ResourceNotFoundException(String entity, String id) {
        super(404, "Not Found", entity + " not found: " + id);
    }
}
