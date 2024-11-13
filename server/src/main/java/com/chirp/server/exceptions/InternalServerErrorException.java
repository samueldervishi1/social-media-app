package com.chirp.server.exceptions;

public class InternalServerErrorException extends ApiException {
	public InternalServerErrorException(String message) {
		super(500 , message);
	}
}