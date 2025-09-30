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
    pub const TOKEN_NOT_FOUND: &'static str = "TOKEN_NOT_FOUND";

    // Admin-specific error codes
    pub const INSUFFICIENT_PERMISSIONS: &'static str = "INSUFFICIENT_PERMISSIONS";
    pub const CANNOT_DISABLE_SELF: &'static str = "CANNOT_DISABLE_SELF";
    pub const CANNOT_DISABLE_SUPER_ADMIN: &'static str = "CANNOT_DISABLE_SUPER_ADMIN";
}
