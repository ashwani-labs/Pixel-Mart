package com.pixelmart.auth.exception;

public class EmailAlreadyExistsException extends AuthException {

    public EmailAlreadyExistsException(String email) {
        super(409, "Conflict", "Email already registered: " + email);
    }
}
