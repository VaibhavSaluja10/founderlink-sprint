package com.founderlink.auth.exception;

public class InvalidRoleRequestException extends RuntimeException {
    public InvalidRoleRequestException(String message) {
        super(message);
    }
}
