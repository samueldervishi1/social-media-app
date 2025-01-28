package com.chirp.server.exceptions;

import com.chirp.server.models.Error;

public class CustomException extends RuntimeException {
	private int code;
	private String message;

	private Error faultObject;

	public CustomException(String message) {
		super(message);
		this.message = message;
	}

	public CustomException(int code , String message) {
		super(message);
		this.code = code;
		this.message = message;
	}

	public CustomException(int code , Error faultObject) {
		super(faultObject.getMessage());
		this.code = code;
		this.faultObject = faultObject;
	}

	public CustomException(Error faultObject) {
		super(faultObject.getMessage());
		this.faultObject = faultObject;
	}

	public CustomException(int code , String message , Error faultObject) {
		super(message);
		this.code = code;
		this.message = message;
		this.faultObject = faultObject;
	}

	public Error getFaultObject() {
		return faultObject;
	}

	public void setFaultObject(Error faultObject) {
		this.faultObject = faultObject;
	}

	public int getCode() {
		return code;
	}

	public void setCode(int code) {
		this.code = code;
	}

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}
}