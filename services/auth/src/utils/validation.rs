use crate::proto_generated::*;

/// Validation utilities for proto types
pub struct ProtoValidator;

impl ProtoValidator {
    /// Validate signup request
    pub fn validate_signup_request(request: &AuthSignupRequest) -> Result<(), String> {
        if request.email.is_empty() {
            return Err("Email is required".to_string());
        }
        if request.password.len() < 8 {
            return Err("Password must be at least 8 characters".to_string());
        }
        if request.name.is_empty() {
            return Err("Name is required".to_string());
        }
        // Basic email validation
        if !request.email.contains('@') {
            return Err("Invalid email format".to_string());
        }
        Ok(())
    }

    /// Validate signin request
    pub fn validate_signin_request(request: &AuthSigninRequest) -> Result<(), String> {
        if request.email.is_empty() {
            return Err("Email is required".to_string());
        }
        if request.password.is_empty() {
            return Err("Password is required".to_string());
        }
        if !request.email.contains('@') {
            return Err("Invalid email format".to_string());
        }
        Ok(())
    }

    /// Validate logout request
    pub fn validate_logout_request(request: &AuthLogoutRequest) -> Result<(), String> {
        if request.token.is_empty() {
            return Err("Token is required".to_string());
        }
        Ok(())
    }

    /// Validate token verify request
    pub fn validate_token_verify_request(request: &AuthTokenVerifyRequest) -> Result<(), String> {
        if request.token.is_empty() {
            return Err("Token is required".to_string());
        }
        Ok(())
    }

    /// Validate token info request
    pub fn validate_token_info_request(request: &AuthTokenInfoRequest) -> Result<(), String> {
        if request.token.is_empty() {
            return Err("Token is required".to_string());
        }
        Ok(())
    }

    /// Validate token refresh request
    pub fn validate_token_refresh_request(request: &AuthTokenRefreshRequest) -> Result<(), String> {
        if request.token.is_empty() {
            return Err("Token is required".to_string());
        }
        Ok(())
    }
}
