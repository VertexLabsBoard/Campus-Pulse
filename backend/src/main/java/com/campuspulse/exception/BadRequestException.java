package com.campuspulse.exception;

import org.springframework.http.HttpStatus;

import java.util.Map;

public class BadRequestException extends AppException {
    public BadRequestException(String message) {
        super("BAD_REQUEST", message, HttpStatus.BAD_REQUEST);
    }

    public BadRequestException(String message, Map<String, Object> details) {
        super("BAD_REQUEST", message, HttpStatus.BAD_REQUEST, details);
    }
}
