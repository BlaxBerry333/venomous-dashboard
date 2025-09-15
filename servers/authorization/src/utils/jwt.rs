use chrono::{Duration, Utc};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, TokenData, Validation};
use serde::{Deserialize, Serialize};
use std::env;
use thiserror::Error;
use uuid::Uuid;

#[derive(Debug, Error)]
pub enum JwtError {
    #[error("Invalid token: {0}")]
    InvalidToken(#[from] jsonwebtoken::errors::Error),
    #[error("Token expired")]
    TokenExpired,
    #[error("Missing JWT secret")]
    MissingSecret,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,      // Subject (user ID)
    pub email: String,    // User email
    pub role: String,     // User role
    pub exp: i64,         // Expiration time (Unix timestamp)
    pub iat: i64,         // Issued at (Unix timestamp)
    pub iss: String,      // Issuer
}

pub struct JwtService;

impl JwtService {
    /// Get JWT secret from environment
    fn get_secret() -> Result<String, JwtError> {
        env::var("JWT_SECRET").map_err(|_| JwtError::MissingSecret)
    }

    /// Get JWT expiration hours from environment (default: 24 hours)
    fn get_expiration_hours() -> i64 {
        env::var("JWT_EXPIRATION_HOURS")
            .unwrap_or_else(|_| "24".to_string())
            .parse()
            .unwrap_or(24)
    }

    /// Generate a new JWT token
    pub fn generate_token(
        user_id: Uuid,
        email: &str,
        role: &str,
    ) -> Result<String, JwtError> {
        let secret = Self::get_secret()?;
        let exp_hours = Self::get_expiration_hours();

        let now = Utc::now();
        let exp = now + Duration::hours(exp_hours);

        let claims = Claims {
            sub: user_id.to_string(),
            email: email.to_string(),
            role: role.to_string(),
            exp: exp.timestamp(),
            iat: now.timestamp(),
            iss: "venomous-dashboard-auth".to_string(),
        };

        let token = encode(
            &Header::default(),
            &claims,
            &EncodingKey::from_secret(secret.as_ref()),
        )?;

        Ok(token)
    }

    /// Validate and decode a JWT token
    pub fn validate_token(token: &str) -> Result<TokenData<Claims>, JwtError> {
        let secret = Self::get_secret()?;

        let mut validation = Validation::default();
        validation.set_issuer(&["venomous-dashboard-auth"]);

        let token_data = decode::<Claims>(
            token,
            &DecodingKey::from_secret(secret.as_ref()),
            &validation,
        )?;

        // Check if token is expired (additional check)
        let now = Utc::now().timestamp();
        if token_data.claims.exp < now {
            return Err(JwtError::TokenExpired);
        }

        Ok(token_data)
    }

    /// Extract user ID from token
    pub fn extract_user_id(token: &str) -> Result<Uuid, JwtError> {
        let token_data = Self::validate_token(token)?;
        let user_id = Uuid::parse_str(&token_data.claims.sub)
            .map_err(|_| JwtError::InvalidToken(jsonwebtoken::errors::Error::from(
                jsonwebtoken::errors::ErrorKind::InvalidSubject
            )))?;
        Ok(user_id)
    }

    /// Extract user email from token
    pub fn extract_email(token: &str) -> Result<String, JwtError> {
        let token_data = Self::validate_token(token)?;
        Ok(token_data.claims.email)
    }

    /// Extract user role from token
    pub fn extract_role(token: &str) -> Result<String, JwtError> {
        let token_data = Self::validate_token(token)?;
        Ok(token_data.claims.role)
    }

    /// Check if token is expired
    pub fn is_token_expired(token: &str) -> bool {
        match Self::validate_token(token) {
            Ok(_) => false,
            Err(JwtError::TokenExpired) => true,
            Err(_) => true, // Treat any validation error as expired
        }
    }

    /// Refresh a token (generate new token with same claims but new expiration)
    pub fn refresh_token(token: &str) -> Result<String, JwtError> {
        let token_data = Self::validate_token(token)?;
        let claims = token_data.claims;

        // Generate new token with same user data
        let user_id = Uuid::parse_str(&claims.sub)
            .map_err(|_| JwtError::InvalidToken(jsonwebtoken::errors::Error::from(
                jsonwebtoken::errors::ErrorKind::InvalidSubject
            )))?;

        Self::generate_token(user_id, &claims.email, &claims.role)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::env;

    #[test]
    fn test_jwt_generation_and_validation() {
        env::set_var("JWT_SECRET", "test-secret-key");
        env::set_var("JWT_EXPIRATION_HOURS", "1");

        let user_id = Uuid::new_v4();
        let email = "test@example.com";
        let role = "user";

        // Generate token
        let token = JwtService::generate_token(user_id, email, role).unwrap();
        assert!(!token.is_empty());

        // Validate token
        let token_data = JwtService::validate_token(&token).unwrap();
        assert_eq!(token_data.claims.sub, user_id.to_string());
        assert_eq!(token_data.claims.email, email);
        assert_eq!(token_data.claims.role, role);

        // Extract data
        assert_eq!(JwtService::extract_user_id(&token).unwrap(), user_id);
        assert_eq!(JwtService::extract_email(&token).unwrap(), email);
        assert_eq!(JwtService::extract_role(&token).unwrap(), role);

        // Check expiration
        assert!(!JwtService::is_token_expired(&token));
    }

    #[test]
    fn test_invalid_token() {
        env::set_var("JWT_SECRET", "test-secret-key");

        let result = JwtService::validate_token("invalid-token");
        assert!(result.is_err());
    }
}