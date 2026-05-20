package com.pixelmart.catalog.exception;

public class ConflictException extends CatalogException {

    public ConflictException(String message) {
        super(409, "Conflict", message);
    }
}
