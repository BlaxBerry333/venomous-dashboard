use serde_json::{json, Value};

/// Standard API response structure for success cases
pub struct ApiResponse;

impl ApiResponse {
    /// Create a success response with data
    pub fn success(data: Value) -> Value {
        json!({
            "success": true,
            "data": data
        })
    }

    /// Create an error response with code and message
    pub fn error(code: &str, message: &str) -> Value {
        json!({
            "success": false,
            "error": {
                "code": code,
                "message": message
            }
        })
    }
}

/// Common error codes used across the application
pub struct ErrorCode;

impl ErrorCode {
    pub const TOKEN_INVALID: &'static str = "TOKEN_INVALID";
    pub const TOKEN_REFRESH_FAILED: &'static str = "TOKEN_REFRESH_FAILED";
    pub const SIGNUP_FAILED: &'static str = "SIGNUP_FAILED";
    pub const SIGNIN_FAILED: &'static str = "SIGNIN_FAILED";
    pub const VALIDATION_ERROR: &'static str = "VALIDATION_ERROR";
    pub const WEAK_PASSWORD: &'static str = "WEAK_PASSWORD";
    pub const USER_ALREADY_EXISTS: &'static str = "USER_ALREADY_EXISTS";
    pub const DATABASE_ERROR: &'static str = "DATABASE_ERROR";
    pub const INTERNAL_SERVER_ERROR: &'static str = "INTERNAL_SERVER_ERROR";
    pub const INVALID_CREDENTIALS: &'static str = "INVALID_CREDENTIALS";
    pub const USER_NOT_FOUND: &'static str = "USER_NOT_FOUND";
    pub const ACCOUNT_LOCKED: &'static str = "ACCOUNT_LOCKED";
    pub const JWT_ERROR: &'static str = "JWT_ERROR";

    // Admin-specific error codes
    pub const INSUFFICIENT_PERMISSIONS: &'static str = "INSUFFICIENT_PERMISSIONS";
    pub const CANNOT_DISABLE_SELF: &'static str = "CANNOT_DISABLE_SELF";
    pub const CANNOT_DISABLE_SUPER_ADMIN: &'static str = "CANNOT_DISABLE_SUPER_ADMIN";
}

/// Detailed error messages for user-friendly responses
/// These messages provide clear, actionable feedback to users and administrators
pub struct ErrorMessage;

impl ErrorMessage {
    // Authentication & token messages
    pub const TOKEN_INVALID_OR_EXPIRED: &'static str =
        "Your authentication token is invalid or has expired. Please log in again to continue.";
    pub const TOKEN_REFRESH_FAILED: &'static str =
        "Unable to refresh your authentication token. Please log in again to obtain a new session.";
    pub const SIGNUP_CREATION_FAILED: &'static str =
        "We encountered an error while creating your account. Please try again or contact support if the problem persists.";
    pub const SIGNIN_AUTHENTICATION_FAILED: &'static str =
        "Authentication failed. Please check your credentials and try again.";
    pub const INVALID_INPUT_DATA: &'static str =
        "The information you provided is not valid. Please check all required fields and ensure they meet the specified requirements.";
    pub const PASSWORD_TOO_WEAK: &'static str =
        "Your password doesn't meet our security requirements. Please use at least 8 characters including both letters and numbers.";
    pub const EMAIL_ALREADY_REGISTERED: &'static str =
        "An account with this email address already exists. Please use a different email or try signing in instead.";
    pub const SERVER_ERROR_OCCURRED: &'static str =
        "We're experiencing technical difficulties. Please try again in a few moments. If the problem continues, contact our support team.";
    pub const CREDENTIALS_INVALID: &'static str =
        "The email or password you entered is incorrect. Please double-check your credentials and try again.";
    pub const USER_DOES_NOT_EXIST: &'static str =
        "No account found with the provided information. Please check your email address or create a new account.";
    pub const ACCOUNT_TEMPORARILY_LOCKED: &'static str =
        "Your account has been temporarily locked due to multiple failed login attempts. Please wait a few minutes before trying again or contact support.";
    pub const JWT_PROCESSING_ERROR: &'static str =
        "There was an error processing your authentication. Please log out and log back in to resolve this issue.";

    // Admin-specific error messages
    pub const AUTH_HEADER_MISSING: &'static str =
        "Authentication credentials are missing or invalid. Please ensure you're properly logged in and have the necessary permissions.";
    pub const TOKEN_EXPIRED_OR_INVALID: &'static str =
        "Your admin session has expired or is invalid. Please log in again with your administrator credentials.";
    pub const USER_ID_INVALID_IN_TOKEN: &'static str =
        "The user identification in your authentication token is malformed. Please log out and log back in.";
    pub const USER_INFO_RETRIEVAL_FAILED: &'static str =
        "Unable to retrieve user information from the database. This may be a temporary issue - please try again.";
    pub const ADMIN_PRIVILEGES_REQUIRED: &'static str =
        "This action requires administrator privileges. Please ensure you're logged in with an admin account and have the necessary permissions.";
    pub const USER_ID_FORMAT_INVALID: &'static str =
        "The user ID provided is not in the correct format. Please verify the ID and try again.";
    pub const SELF_ACCOUNT_DISABLE_FORBIDDEN: &'static str =
        "You cannot disable your own administrator account for security reasons. Please ask another administrator to perform this action.";
    pub const USER_LOOKUP_FAILED: &'static str =
        "Unable to locate the specified user in our system. The user may have been deleted or the ID may be incorrect.";
    pub const USER_STATUS_UPDATE_FAILED: &'static str =
        "Failed to update the user's account status. Please try again or contact technical support if the issue persists.";
    pub const PASSWORD_GENERATION_FAILED: &'static str =
        "Unable to generate a new secure password. Please try the password reset operation again.";
    pub const PASSWORD_RESET_FAILED: &'static str =
        "Failed to reset the user's password. Please verify the user exists and try again, or contact technical support.";
    pub const SECURITY_LOGS_RETRIEVAL_FAILED: &'static str =
        "Unable to retrieve security audit logs at this time. This may be due to database connectivity issues - please try again later.";
    pub const SESSION_REVOCATION_FAILED: &'static str =
        "Failed to revoke user sessions. The user may still have active sessions - please try again or contact technical support.";
    pub const USERS_RETRIEVAL_FAILED: &'static str =
        "Unable to retrieve the user list from the database. This may be a temporary connectivity issue - please refresh and try again.";

    // Account lockout specific messages
    pub const ACCOUNT_LOCKED_TEMPORARILY: &'static str =
        "Your account has been temporarily locked for security reasons due to multiple failed login attempts. The account will automatically unlock after 30 minutes, or you can contact an administrator for immediate assistance.";
    pub const ACCOUNT_LOCKED_WITH_COUNTDOWN: &'static str =
        "Your account is temporarily locked due to multiple failed login attempts. Please try again in {} minutes, or contact support if you need immediate assistance.";
    pub const ACCOUNT_LOCKED_PERMANENTLY: &'static str =
        "Your account is locked and requires administrator intervention to unlock. Please contact your system administrator for assistance.";
    pub const ACCOUNT_UNLOCK_SUCCESS: &'static str =
        "The user account has been successfully unlocked. The user can now attempt to log in again.";
    pub const ACCOUNT_UNLOCK_FAILED: &'static str =
        "Failed to unlock the user account. Please verify the user exists and try again, or contact technical support.";
    pub const ACCOUNT_LOCK_CHECK_FAILED: &'static str =
        "Unable to verify account lock status due to a database error. Please try again or contact support.";
    pub const ACCOUNT_AUTO_UNLOCK_INFO: &'static str =
        "Account lockouts are automatically lifted after 30 minutes for security purposes. You can also contact an administrator for immediate unlock if needed.";
}
