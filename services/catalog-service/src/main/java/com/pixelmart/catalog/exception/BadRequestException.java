package com.pixelmart.catalog.exception;

public class BadRequestException extends CatalogException {

    public BadRequestException(String message) {
        super(400, "Bad Request", message);
    }
}
