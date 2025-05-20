package com.chattr.server.exceptions;

import com.chattr.server.models.Error;
import lombok.Getter;

/**
 * Custom application exception class that supports:
 * - Error code (HTTP-style or custom)
 * - Optional structured error model (`Error` object)
 */
@Getter
public class CustomException extends RuntimeException {

    private final int code;
    private final Error faultObject;

    /**
     * Constructor with only a message.
     * Defaults to 400 Bad Request-style code.
     */
    public CustomException(String message) {
        super(message);
        this.code = 400;
        this.faultObject = null;
    }

    /**
     * Constructor with code and message.
     */
    public CustomException(int code, String message) {
        super(message);
        this.code = code;
        this.faultObject = null;
    }

    /**
     * Constructor with code and a detailed error object.
     */
    public CustomException(int code, Error faultObject) {
        super(faultObject != null ? faultObject.getMessage() : "Unknown error");
        this.code = code;
        this.faultObject = faultObject;
    }

    /**
     * Constructor with only an error object.
     * Defaults to 400 error codes.
     */
    public CustomException(Error faultObject) {
        super(faultObject != null ? faultObject.getMessage() : "Unknown error");
        this.code = 400;
        this.faultObject = faultObject;
    }

    /**
     * Full constructor with message, code, and error object.
     */
    public CustomException(int code, String message, Error faultObject) {
        super(message);
        this.code = code;
        this.faultObject = faultObject;
    }

}