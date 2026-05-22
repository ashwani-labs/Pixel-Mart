package com.pixelmart.order.exception;

public abstract class OrderException extends RuntimeException {

    private final int status;
    private final String error;

    protected OrderException(int status, String error, String message) {
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
