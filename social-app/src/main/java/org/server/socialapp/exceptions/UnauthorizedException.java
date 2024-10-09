package org.server.socialapp.exceptions;

public class UnauthorizedException extends ApiException {
    public UnauthorizedException(String message) {
        super(401, message);
    }
}
