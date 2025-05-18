package com.chattr.server.models;

import java.util.regex.Pattern;

/**
 * Centralized set of application-wide constants for error messages, validation rules, and user feedback.
 */
public final class Messages {

	// === Roles ===
	public static final String DEFAULT_ROLE = "simple_account";

	// === Validation Messages ===
	public static final String INVALID_EMAIL_FORMAT = "Please enter a valid email address.";
	public static final String EMAIL_ALREADY_EXISTS = "This email is already in use.";
	public static final String USERNAME_ALREADY_EXISTS = "This username is already taken.";
	public static final String NAME_TOO_SHORT = "Full name must be at least 2 characters.";
	public static final String INVALID_PASSWORD_FORMAT = "Password must be at least 8 characters long and include a letter, a number, and a symbol.";

	// === Regex Patterns ===
	public static final Pattern EMAIL_PATTERN = Pattern.compile("^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$");
	public static final Pattern PASSWORD_PATTERN = Pattern.compile("^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*#?&])[A-Za-z\\d@$!%*#?&]{8,}$");

	// === User-related Errors ===
	public static final String USER_ID_ERROR = "User ID must not be null or empty.";
	public static final String USER_NOT_FOUND_BY_USERNAME = "No user found with username: %s";
	public static final String USER_NOT_FOUND_BY_ID = "No user found with ID: %s";
	public static final String USER_NOT_FOUND = "User not found. %s";
	public static final String USERNAME_INCORRECT = "The username provided is incorrect.";
	public static final String USER_DELETED = "No active account found with this username.";
	public static final String INVALID_CREDENTIALS = "The password you entered is incorrect.";
	public static final String ACCOUNT_DEACTIVATED = "This account is temporarily deactivated. Please contact support.";

	// === Report / History / Post ===
	public static final String USER_ALREADY_REPORTED = "User %s has already reported post %s.";
	public static final String POST_NOT_FOUND = "Post with ID %s not found.";
	public static final String REPORT_ERROR = "Unable to submit report. Please try again.";
	public static final String NO_HISTORY_ERROR = "No history found for user ID: %s";
	public static final String COMMENT_NOT_FOUND = "Comment with ID %s not found.";

	// === Community ===
	public static final String COMMUNITY_NOT_FOUND = "Community with identifier %s does not exist.";
	public static final String COMMUNITY_EXISTS = "A community with the name %s already exists.";

	// === Model & System Errors ===
	public static final String ERROR_MODEL_API_URL = "Model API URL is not configured correctly.";
	public static final String ERROR_MODEL = "The model is not set up correctly.";
	public static final String ERROR_UNEXPECTED = "Something went wrong while processing your request.";
	public static final String ERROR_UNEXPECTED_FORMAT = "The response format was not expected.";
	public static final String ERROR_500 = "Internal server error. Please try again later.";

	// === Registration ===
	public static final String REGISTER_SUCCESS = "You have registered successfully.";
	public static final String REGISTER_FAILED = "Registration failed. Please try again.";
	public static final String MISSING_FIELDS = "Please fill in all required fields.";

	private Messages() {
		// Prevent instantiation
	}
}