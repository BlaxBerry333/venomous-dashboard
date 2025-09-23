use serde::{Deserialize, Serialize};
use validator::Validate;

/// Request payload for login operations
#[derive(Debug, Deserialize, Serialize, Validate)]
pub struct AuthPayload {
    #[validate(email)]
    pub email: String,
    #[validate(length(min = 8, message = "Password must be at least 8 characters"))]
    pub password: String,
}

/// Request payload for signup operations
#[derive(Debug, Deserialize, Serialize, Validate)]
pub struct SignupPayload {
    #[validate(email)]
    pub email: String,
    #[validate(length(min = 8, message = "Password must be at least 8 characters"))]
    pub password: String,
    #[validate(length(min = 1, message = "Name is required"))]
    pub name: String,
}

/// Request payload for logout operations
#[derive(Debug, Deserialize, Serialize)]
pub struct LogoutPayload {
    pub token: String,
}

/// Request payload for token-related operations
#[derive(Debug, Deserialize, Serialize)]
pub struct TokenRequest {
    pub token: String,
}
