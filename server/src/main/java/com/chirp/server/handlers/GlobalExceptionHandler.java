package com.chirp.server.handlers;

import com.chirp.server.exceptions.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.time.LocalDateTime;

@ControllerAdvice
public class GlobalExceptionHandler {


	@ExceptionHandler(UnauthorizedException.class)
	public ResponseEntity<ErrorResponse> handleUnauthorizedException(UnauthorizedException ex) {
		return new ResponseEntity<>(new ErrorResponse("Unauthorized to access data" , HttpStatus.UNAUTHORIZED.value()) , HttpStatus.UNAUTHORIZED);
	}

	@ExceptionHandler(NotFoundException.class)
	public ResponseEntity<ErrorResponse> handleNotFoundException(NotFoundException ex) {
		return new ResponseEntity<>(new ErrorResponse("Data not found" , HttpStatus.NOT_FOUND.value()) , HttpStatus.NOT_FOUND);
	}

	@ExceptionHandler(BadRequestException.class)
	public ResponseEntity<ErrorResponse> handleBadRequestException(BadRequestException ex) {
		return new ResponseEntity<>(new ErrorResponse("Bad Request" , HttpStatus.BAD_REQUEST.value()) , HttpStatus.BAD_REQUEST);
	}

	@ExceptionHandler(InternalServerErrorException.class)
	public ResponseEntity<ErrorResponse> handleInternalServerErrorException(InternalServerErrorException ex) {
		return new ResponseEntity<>(new ErrorResponse("Internal Server Error" , HttpStatus.INTERNAL_SERVER_ERROR.value()) , HttpStatus.INTERNAL_SERVER_ERROR);
	}

	@ExceptionHandler(TooManyRequestsException.class)
    public ResponseEntity<ErrorResponse> handleTooManyRequestsException(TooManyRequestsException ex) {
        return new ResponseEntity<>(new ErrorResponse("Too many requests. Please wait and try again.", HttpStatus.TOO_MANY_REQUESTS.value()), HttpStatus.TOO_MANY_REQUESTS);
    }

	public record ErrorResponse(String message , int statusCode , LocalDateTime timestamp) {
		public ErrorResponse(String message , int statusCode) {
			this(message , statusCode , LocalDateTime.now());
		}
	}
}