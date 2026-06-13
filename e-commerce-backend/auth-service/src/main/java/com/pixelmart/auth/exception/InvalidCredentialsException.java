package com.pixelmart.auth.exception;

public class InvalidCredentialsException extends AuthException {

    public InvalidCredentialsException() {
        super(401, "Unauthorized", "Invalid email or password");
    }
}
