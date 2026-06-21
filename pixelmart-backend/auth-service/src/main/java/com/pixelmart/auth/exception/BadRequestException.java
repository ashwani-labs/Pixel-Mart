package com.pixelmart.auth.exception;

import org.springframework.http.HttpStatus;

public class BadRequestException extends AuthException {

  public BadRequestException(String message) {
    super(HttpStatus.BAD_REQUEST.value(), "Bad Request", message);
  }
}
