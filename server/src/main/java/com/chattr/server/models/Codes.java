package com.chattr.server.models;

import java.util.regex.Pattern;

public class Codes {

    public static final String DEFAULT_ROLE = "simple_account";
    public static final String INVALID_EMAIL_FORMAT = "Invalid email format";
    public static final String EMAIL_ALREADY_EXISTS = "Email already exists";
    public static final String USERNAME_ALREADY_EXISTS = "Username already exists";
    public static final String NAME_TOO_SHORT = "Full name should be at least 2 characters long";
    public static final String INVALID_PASSWORD_FORMAT = "Password should be at least 8 characters long, including one letter, one symbol, and one number";

    public static final Pattern EMAIL_PATTERN = Pattern.compile("^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$");
    public static final Pattern PASSWORD_PATTERN = Pattern.compile("^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*#?&])[A-Za-z\\d@$!%*#?&]{8,}$");

    public static final String USER_ALREADY_REPORTED = "User %s has already reported post %s";
    public static final String POST_NOT_FOUND = "Post with ID %s not found.";
    public static final String REPORT_ERROR = "Failed to create report";

    public static final String USER_NOT_FOUND_BY_USERNAME = "User not found with username: %s";
    public static final String USER_NOT_FOUND_BY_ID = "User not found with ID: %s";

    public static final String USER_ID_ERROR = "User ID cannot be null or empty";

    public static final String USER_NOT_FOUND = "User not found with username: %s";

    public static final String USERNAME_INCORRECT = "Username is incorrect";
    public static final String USER_DELETED = "No account found with this username";
    public static final String INVALID_CREDENTIALS = "Password is incorrect";

    public static final String NO_HISTORY_ERROR = "No history exists for userId: %s";

    public static final String COMMUNITY_NOT_FOUND = "Community with %s does not exist";
    public static final String COMMUNITY_EXISTS = "Community with name %s already exists";

    public static final String ERROR_500 = "Internal server error";

    public static final String COMMENT_NOT_FOUND = "Comment with ID %s not found.";

    public static final String ERROR_MODEL_API_URL = "Model API URL is not configured properly.";
    public static final String ERROR_MODEL = "Model is not configured properly.";
    public static final String ERROR_UNEXPECTED = "An unexpected error occurred while processing the message.";
    public static final String ERROR_UNEXPECTED_FORMAT = "Unexpected response format.";

    public static final String REGISTER_SUCCESS = "Successfully registered";
    public static final String REGISTER_FAILED = "Failed to register";
    public static final String MISSING_FIELDS = "Missing required fields";

    public static final String ACCOUNT_DEACTIVATED = "Account temporarily deactivated. Please contact support.";

    private Codes() {
    }
}