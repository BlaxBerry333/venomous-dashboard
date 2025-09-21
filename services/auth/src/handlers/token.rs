use axum::{extract::State, http::StatusCode, response::Json};
use serde_json::{json, Value};
use std::sync::Arc;

use crate::database::Database;
use crate::models::{ApiResponse, ErrorCode, ErrorMessage, TokenRequest};
use crate::utils::JwtService;

/// Handler for token verification
pub async fn token_verify_handler(
    State(db): State<Arc<Database>>,
    Json(payload): Json<TokenRequest>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    tracing::info!(
        "Token verification request received for token: {}",
        payload.token
    );

    // Validate and decode JWT token
    match JwtService::validate_token(&payload.token) {
        Ok(token_data) => {
            let user_id = match uuid::Uuid::parse_str(&token_data.claims.sub) {
                Ok(id) => id,
                Err(_) => {
                    return Err((
                        StatusCode::UNAUTHORIZED,
                        Json(ApiResponse::error(
                            ErrorCode::TOKEN_INVALID,
                            ErrorMessage::TOKEN_INVALID_OR_EXPIRED,
                        )),
                    ));
                }
            };

            // Optionally verify user still exists in database
            match db.find_user_by_id(user_id) {
                Ok(Some(user)) => {
                    let role = match db.get_user_role(user_id) {
                        Ok(r) => r.unwrap_or("user".to_string()),
                        Err(_) => "user".to_string(),
                    };
                    Ok(Json(ApiResponse::success(json!({
                        "valid": true,
                        "user_id": user.id,
                        "email": user.email,
                        "name": user.name,
                        "role": role,
                        "expires_at": token_data.claims.exp,
                        "issued_at": token_data.claims.iat
                    }))))
                }
                Ok(None) => {
                    // User no longer exists
                    Err((
                        StatusCode::UNAUTHORIZED,
                        Json(ApiResponse::error(
                            ErrorCode::USER_NOT_FOUND,
                            ErrorMessage::TOKEN_INVALID_OR_EXPIRED,
                        )),
                    ))
                }
                Err(e) => {
                    tracing::error!("Database error verifying user existence: {}", e);
                    Err((
                        StatusCode::INTERNAL_SERVER_ERROR,
                        Json(ApiResponse::error(
                            ErrorCode::DATABASE_ERROR,
                            ErrorMessage::SERVER_ERROR_OCCURRED,
                        )),
                    ))
                }
            }
        }
        Err(e) => {
            tracing::warn!("Token validation failed: {}", e);
            Err((
                StatusCode::UNAUTHORIZED,
                Json(ApiResponse::error(
                    ErrorCode::TOKEN_INVALID,
                    ErrorMessage::TOKEN_INVALID_OR_EXPIRED,
                )),
            ))
        }
    }
}

/// Handler for retrieving token information
pub async fn token_info_handler(
    State(db): State<Arc<Database>>,
    Json(payload): Json<TokenRequest>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    tracing::info!("Token info request received for token: {}", payload.token);

    // Validate and decode JWT token
    match JwtService::validate_token(&payload.token) {
        Ok(token_data) => {
            let user_id = match uuid::Uuid::parse_str(&token_data.claims.sub) {
                Ok(id) => id,
                Err(_) => {
                    return Err((
                        StatusCode::UNAUTHORIZED,
                        Json(ApiResponse::error(
                            ErrorCode::TOKEN_INVALID,
                            ErrorMessage::TOKEN_INVALID_OR_EXPIRED,
                        )),
                    ));
                }
            };

            // Get fresh user data from database
            match db.find_user_by_id(user_id) {
                Ok(Some(user)) => {
                    let role = match db.get_user_role(user_id) {
                        Ok(r) => r.unwrap_or("user".to_string()),
                        Err(_) => "user".to_string(),
                    };

                    Ok(Json(ApiResponse::success(json!({
                        "valid": true,
                        "user_id": user.id,
                        "email": user.email,
                        "role": role,
                        "issued_at": token_data.claims.iat,
                        "expires_at": token_data.claims.exp
                    }))))
                }
                Ok(None) => Err((
                    StatusCode::UNAUTHORIZED,
                    Json(ApiResponse::error(
                        ErrorCode::USER_NOT_FOUND,
                        ErrorMessage::TOKEN_INVALID_OR_EXPIRED,
                    )),
                )),
                Err(e) => {
                    tracing::error!("Database error getting user info: {}", e);
                    Err((
                        StatusCode::INTERNAL_SERVER_ERROR,
                        Json(ApiResponse::error(
                            ErrorCode::DATABASE_ERROR,
                            ErrorMessage::SERVER_ERROR_OCCURRED,
                        )),
                    ))
                }
            }
        }
        Err(e) => {
            tracing::warn!("Token validation failed: {}", e);
            Err((
                StatusCode::UNAUTHORIZED,
                Json(ApiResponse::error(
                    ErrorCode::TOKEN_INVALID,
                    ErrorMessage::TOKEN_INVALID_OR_EXPIRED,
                )),
            ))
        }
    }
}

/// Handler for token refresh
pub async fn token_refresh_handler(
    State(db): State<Arc<Database>>,
    Json(payload): Json<TokenRequest>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    tracing::info!(
        "Token refresh request received for token: {}",
        payload.token
    );

    // Validate existing token first
    let token_data = match JwtService::validate_token(&payload.token) {
        Ok(token_data) => token_data,
        Err(e) => {
            tracing::warn!("Token refresh failed - invalid token: {}", e);
            return Err((
                StatusCode::UNAUTHORIZED,
                Json(ApiResponse::error(
                    ErrorCode::TOKEN_INVALID,
                    ErrorMessage::TOKEN_REFRESH_FAILED,
                )),
            ));
        }
    };

    let user_id = match uuid::Uuid::parse_str(&token_data.claims.sub) {
        Ok(id) => id,
        Err(_) => {
            return Err((
                StatusCode::UNAUTHORIZED,
                Json(ApiResponse::error(
                    ErrorCode::TOKEN_INVALID,
                    ErrorMessage::TOKEN_REFRESH_FAILED,
                )),
            ));
        }
    };

    // Verify user still exists
    let user = match db.find_user_by_id(user_id) {
        Ok(Some(user)) => user,
        Ok(None) => {
            return Err((
                StatusCode::UNAUTHORIZED,
                Json(ApiResponse::error(
                    ErrorCode::USER_NOT_FOUND,
                    ErrorMessage::TOKEN_REFRESH_FAILED,
                )),
            ));
        }
        Err(e) => {
            tracing::error!("Database error during token refresh: {}", e);
            return Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::error(
                    ErrorCode::DATABASE_ERROR,
                    ErrorMessage::SERVER_ERROR_OCCURRED,
                )),
            ));
        }
    };

    // Get current role
    let role = match db.get_user_role(user_id) {
        Ok(r) => r.unwrap_or("user".to_string()),
        Err(_) => "user".to_string(),
    };

    // Generate new token
    match JwtService::generate_token(user_id, &user.email, &role) {
        Ok(new_token) => {
            tracing::info!("Token successfully refreshed for user: {}", user.email);

            // Calculate expiration time (24 hours from now by default)
            let exp_hours = std::env::var("JWT_EXPIRATION_HOURS")
                .unwrap_or_else(|_| "24".to_string())
                .parse::<i64>()
                .unwrap_or(24);
            let expires_at = chrono::Utc::now() + chrono::Duration::hours(exp_hours);

            Ok(Json(ApiResponse::success(json!({
                "token": new_token,
                "expires_at": expires_at.timestamp()
            }))))
        }
        Err(e) => {
            tracing::error!("Failed to generate new token: {}", e);
            Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::error(
                    ErrorCode::JWT_ERROR,
                    ErrorMessage::TOKEN_REFRESH_FAILED,
                )),
            ))
        }
    }
}
