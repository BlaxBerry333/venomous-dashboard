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
                            ErrorCode::INVALID_TOKEN,
                            ErrorMessage::TOKEN_INVALID_OR_EXPIRED,
                        )),
                    ));
                }
            };

            // Optionally verify user still exists in database
            match db.find_user_by_id(user_id) {
                Ok(Some(_)) => Ok(Json(ApiResponse::success(json!({
                    "valid": true,
                    "user_id": user_id,
                    "email": token_data.claims.email,
                    "role": token_data.claims.role,
                    "expires_at": token_data.claims.exp
                })))),
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
                            ErrorMessage::INTERNAL_SERVER_ERROR,
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
                    ErrorCode::INVALID_TOKEN,
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
                            ErrorCode::INVALID_TOKEN,
                            ErrorMessage::TOKEN_INVALID_OR_EXPIRED,
                        )),
                    ));
                }
            };

            // Get fresh user data from database
            match db.find_user_by_id(user_id) {
                Ok(Some(user)) => {
                    let role = db
                        .get_user_role(user_id)
                        .unwrap_or(Some("user".to_string()))
                        .unwrap_or("user".to_string());

                    Ok(Json(ApiResponse::success(json!({
                        "user_id": user.id,
                        "email": user.email,
                        "name": user.name,
                        "role": role,
                        "issued_at": token_data.claims.iat,
                        "expires_at": token_data.claims.exp,
                        "issuer": token_data.claims.iss
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
                            ErrorMessage::INTERNAL_SERVER_ERROR,
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
                    ErrorCode::INVALID_TOKEN,
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
                    ErrorCode::INVALID_TOKEN,
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
                    ErrorCode::INVALID_TOKEN,
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
                    ErrorMessage::INTERNAL_SERVER_ERROR,
                )),
            ));
        }
    };

    // Get current role
    let role = db
        .get_user_role(user_id)
        .unwrap_or(Some("user".to_string()))
        .unwrap_or("user".to_string());

    // Generate new token
    match JwtService::generate_token(user_id, &user.email, &role) {
        Ok(new_token) => {
            tracing::info!("Token successfully refreshed for user: {}", user.email);

            Ok(Json(ApiResponse::success(json!({
                "token": new_token,
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "name": user.name,
                    "role": role
                }
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
