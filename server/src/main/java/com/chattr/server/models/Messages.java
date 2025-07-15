package com.chattr.server.models;

import java.util.regex.Pattern;

/**
 * Centralized set of application-wide constants for error messages, validation rules, and user
 * feedback.
 */
public final class Messages {

  // === Roles ===
  public static final String DEFAULT_ROLE = "simple_account";

  // === Validation Messages ===
  public static final String INVALID_EMAIL_FORMAT = "Please enter a valid email address.";
  public static final String EMAIL_ALREADY_EXISTS = "This email is already in use.";
  public static final String USERNAME_ALREADY_EXISTS = "This username is already taken.";
  public static final String NAME_TOO_SHORT = "Full name must be at least 2 characters.";
  public static final String INVALID_PASSWORD_FORMAT =
      "Password must be at least 8 characters long and include a letter, a number, and a symbol.";

  // === Regex Patterns ===
  public static final Pattern EMAIL_PATTERN =
      Pattern.compile(
          "^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$");
  public static final Pattern PASSWORD_PATTERN =
      Pattern.compile("^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*#?&])[A-Za-z\\d@$!%*#?&]{8,}$");

  // === User-related Errors ===
  public static final String USER_ID_ERROR = "User ID must not be null or empty.";
  public static final String USER_NOT_FOUND_BY_USERNAME = "No user found with username: %s";
  public static final String USER_NOT_FOUND_BY_ID = "No user found with ID: %s";
  public static final String USER_NOT_FOUND = "User not found. %s";
  public static final String INVALID_CREDENTIALS = "Invalid username or password.";

  // === Report / History / Post ===
  public static final String USER_ALREADY_REPORTED = "User %s has already reported post %s.";
  public static final String POST_NOT_FOUND = "Post with ID %s not found.";
  public static final String REPORT_ERROR = "Unable to submit report. Please try again.";
  public static final String NO_HISTORY_ERROR = "No history found for user ID: %s";
  public static final String COMMENT_NOT_FOUND = "Comment with ID %s not found.";
  public static final String POST_ALREADY_SAVED = "Post %s already saved by user %s";
  public static final String USER_HAS_NOT_LIKED = "User has not liked anything";
  public static final String ALREADY_LIKED = "User already liked this post";
  public static final String USER_SHOULD_NOT_BE_NULL = "User cannot be null";

  // === Community ===
  public static final String COMMUNITY_NOT_FOUND = "Community with identifier %s does not exist.";
  public static final String COMMUNITY_EXISTS = "A community with the name %s already exists.";
  public static final String ALREADY_MEMBER = "User %s is already a member of this community.";
  public static final String NOT_A_MEMBER = "User %s is not a member of this community.";

  // === Model & System Errors ===
  public static final String ERROR_MODEL_API_URL = "Model API URL is not configured correctly.";
  public static final String ERROR_MODEL = "The model is not set up correctly.";
  public static final String ERROR_UNEXPECTED =
      "Something went wrong while processing your request.";
  public static final String ERROR_UNEXPECTED_FORMAT = "The response format was not expected.";
  public static final String ERROR_500 = "Internal server error. Please try again later.";
  public static final String REQUIRED_CHANNEL_ID = "onboard-ux";
  public static final String INVALID_CHANNEL_ID = "Missing or invalid channelId for registration.";

  // === Registration ===
  public static final String REGISTER_SUCCESS = "User have successfully registered.";
  public static final String REGISTER_FAILED = "Registration failed. Please try again.";
  public static final String MISSING_FIELDS = "Please fill in all required fields.";

  public static final String SENDER_ERROR = "Sender not found";
  public static final String FOLLOW_EXISTS = "Follow request already exists";
  public static final String FOLLOW_NOT_FOUND = "Follow request %s not found";
  public static final String RECEIVER_NOT_FOUND = "Receiver %s not found";
  public static final String FOLLOW_NOT_ACTIONABLE = "Follow request is not actionable";
  public static final String REFUSE = "You can only reject requests sent to you";
  public static final String PENDING = "Only pending requests can be rejected";
  public static final String STORY_NOT_FOUND = "Story not found";
  public static final String BLOCK_NOT_ALLOWED = "You cannot block yourself";

  public static final String INVALID_FILENAME = "Invalid filename: potential path traversal";
  public static final String MISSING_FILE_EXTENSION = "Missing or invalid file extension";
  public static final String UNSUPPORTED_FILE_EXTENSION = "Unsupported file extension";

  private Messages() {
    // Prevent instantiation
  }
}
