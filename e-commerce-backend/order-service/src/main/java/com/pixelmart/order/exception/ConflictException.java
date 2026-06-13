package com.pixelmart.order.exception;

import org.springframework.http.HttpStatus;

public class ConflictException extends OrderException {

    public ConflictException(String message) {
        super(HttpStatus.CONFLICT.value(), "Conflict", message);
    }
}
