package com.pixelmart.auth.exception;

public abstract class AuthException extends RuntimeException {

    private final int status;
    private final String error;

    protected AuthException(int status, String error, String message) {
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
