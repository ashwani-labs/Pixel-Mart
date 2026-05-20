package com.pixelmart.catalog.exception;

public abstract class CatalogException extends RuntimeException {

    private final int status;
    private final String error;

    protected CatalogException(int status, String error, String message) {
        super(message);
        this.status = status;
        this.error = error;
    }

    public int getStatus() {
        return status;
    }

    public String getError() {
        return error;
    }
}
