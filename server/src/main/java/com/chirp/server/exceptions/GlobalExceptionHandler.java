package com.chirp.server.exceptions;

import com.chirp.server.models.Error;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {
	@ExceptionHandler(CustomException.class)
	public ResponseEntity<Error> handleCustomException(CustomException customException) {
		return new ResponseEntity<>(customException.getFaultObject() , HttpStatus.valueOf(customException.getCode()));
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<Error> handleGenericException(Exception generalException) {
		Error error = new Error();
		error.setCode("500");
		error.setMessage(generalException.getMessage());
		error.setReason("Internal Server Error!");
		error.setStatus("error");
		error.referenceError("N/A");
		error.baseType("error");
		error.schemaLocation("N/A");
		error.type(generalException.getClass().getName());
		return new ResponseEntity<>(error , HttpStatus.INTERNAL_SERVER_ERROR);
	}
}