package com.chattr.server.exceptions;

import com.chattr.server.models.Error;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(CustomException.class)
    public ResponseEntity<Error> handleCustomException(CustomException ex) {
        logger.warn("Custom exception: {} - {}", ex.getCode(), ex.getMessage());

        Error error = ex.getFaultObject() != null
                ? ex.getFaultObject()
                : buildError(String.valueOf(ex.getCode()), ex.getMessage(), HttpStatus.valueOf(ex.getCode()));

        return ResponseEntity.status(ex.getCode()).body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Error> handleGenericException(Exception ex) {
        logger.error("Unhandled exception: ", ex);

        Error error = new Error();
        error.setCode("500");
        error.setMessage("Internal Server Error!");
        error.setReason(ex.getMessage());
        error.setStatus("error");
        error.setReferenceError("N/A");
        error.setBaseType("error");
        error.setSchemaLocation("N/A");
        error.setType(ex.getClass().getSimpleName());

        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    private Error buildError(String code, String message, HttpStatus status) {
        return new Error().code(code).message(message).status(status.getReasonPhrase().toLowerCase())
                .referenceError("N/A").baseType("error").schemaLocation("N/A");
    }
}
