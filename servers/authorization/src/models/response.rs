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
    pub const INVALID_TOKEN: &'static str = "INVALID_TOKEN";
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

/// Common error messages
pub struct ErrorMessage;

impl ErrorMessage {
    pub const TOKEN_INVALID_OR_EXPIRED: &'static str = "Token is invalid or expired";
    pub const UNABLE_TO_REFRESH_TOKEN: &'static str = "Unable to refresh token";
    pub const SIGNUP_FAILED: &'static str = "Failed to create account";
    pub const SIGNIN_FAILED: &'static str = "Failed to sign in";
    pub const INVALID_INPUT_DATA: &'static str = "Invalid input data provided";
    pub const WEAK_PASSWORD: &'static str = "Password must be at least 8 characters with letters and numbers";
    pub const USER_ALREADY_EXISTS: &'static str = "User with this email already exists";
    pub const INTERNAL_SERVER_ERROR: &'static str = "Internal server error occurred";
    pub const INVALID_CREDENTIALS: &'static str = "Invalid email or password";
    pub const USER_NOT_FOUND: &'static str = "User not found";
    pub const ACCOUNT_LOCKED: &'static str = "Account is locked due to too many failed login attempts";
    pub const TOKEN_REFRESH_FAILED: &'static str = "Failed to refresh token";
}