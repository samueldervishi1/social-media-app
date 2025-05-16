package com.chattr.server.exceptions;

import com.chattr.server.models.Error;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Central exception handler for all REST controllers.
 * Handles custom and generic exceptions and returns consistent error responses.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

	/**
	 * Handles custom application exceptions.
	 * If a detailed Error object is provided, use it directly.
	 * Otherwise, construct a basic error response from the exception's code and message.
	 */
	@ExceptionHandler(CustomException.class)
	public ResponseEntity<Error> handleCustomException(CustomException ex) {
		Error error = ex.getFaultObject();

		if (error == null) {
			error = buildBasicError(
					String.valueOf(ex.getCode()) ,
					ex.getMessage() ,
					HttpStatus.valueOf(ex.getCode())
			);
		}

		return new ResponseEntity<>(error , HttpStatus.valueOf(ex.getCode()));
	}

	/**
	 * Handles uncaught exceptions in the system.
	 * Builds a default 500 Internal Server Error response with debug info.
	 */
	@ExceptionHandler(Exception.class)
	public ResponseEntity<Error> handleGenericException(Exception ex) {
		Error error = new Error();
		error.setCode("500");
		error.setMessage("Internal Server Error!");
		error.setReason(ex.getMessage());
		error.setStatus("error");
		error.referenceError("N/A");
		error.baseType("error");
		error.schemaLocation("N/A");
		error.type(ex.getClass().getName());

		return new ResponseEntity<>(error , HttpStatus.INTERNAL_SERVER_ERROR);
	}

	/**
	 * Utility method for building a basic error response.
	 *
	 * @param code    the error code as string
	 * @param message user-facing message
	 * @param status  corresponding HTTP status
	 * @return error response model
	 */
	private Error buildBasicError(String code , String message , HttpStatus status) {
		Error error = new Error();
		error.setCode(code);
		error.setMessage(message);
		error.setStatus(status.getReasonPhrase().toLowerCase());
		return error;
	}
}