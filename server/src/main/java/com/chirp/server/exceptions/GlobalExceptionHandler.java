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
		error.setMessage("Something went wrong!");
		return new ResponseEntity<>(error , HttpStatus.INTERNAL_SERVER_ERROR);
	}
}