use serde::{Deserialize, Serialize};
use validator::Validate;

/// Request payload for login/signup operations
#[derive(Debug, Deserialize, Serialize, Validate)]
pub struct AuthPayload {
    #[validate(email)]
    pub email: String,
    #[validate(length(min = 8, message = "Password must be at least 8 characters"))]
    pub password: String,
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
