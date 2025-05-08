package com.chattr.server.exceptions;

import com.chattr.server.models.Error;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class CustomException extends RuntimeException {
    private int code;
    private String message;

    private Error faultObject;

    public CustomException(String message) {
        super(message);
        this.message = message;
    }

    public CustomException(int code, String message) {
        super(message);
        this.code = code;
        this.message = message;
    }

    public CustomException(int code, Error faultObject) {
        super(faultObject.getMessage());
        this.code = code;
        this.faultObject = faultObject;
    }

    public CustomException(Error faultObject) {
        super(faultObject.getMessage());
        this.faultObject = faultObject;
    }

    public CustomException(int code, String message, Error faultObject) {
        super(message);
        this.code = code;
        this.message = message;
        this.faultObject = faultObject;
    }
}