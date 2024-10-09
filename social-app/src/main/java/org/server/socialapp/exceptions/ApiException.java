package org.server.socialapp.exceptions;

public abstract class ApiException extends RuntimeException {
    private final int statusCode;
    private final String message;

    protected ApiException(int statusCode, String message) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
    }

    public int getStatusCode() {
        return statusCode;
    }

    public String getMessage() {
        return message;
    }
}