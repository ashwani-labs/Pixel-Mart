package com.pixelmart.order.exception;

public class BadRequestException extends OrderException {

    public BadRequestException(String message) {
        super(400, "Bad Request", message);
    }
}
