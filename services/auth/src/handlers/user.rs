use axum::{
    extract::State,
    http::{HeaderMap, StatusCode},
    response::Json,
};
use serde::Deserialize;
use serde_json::{json, Value};
use std::sync::Arc;
use uuid::Uuid;

use crate::database::Database;
use crate::models::ApiResponse;
use crate::proto_generated::*;
use crate::utils::JwtService;
use crate::{ErrorCode, ErrorMessage};

// Simple request structures (not using proto for now)
#[derive(Deserialize)]
pub struct UserUpdateRequest {
    pub name: Option<String>,
    pub avatar_path: Option<String>,
}

/// Extract user ID from Authorization header
fn extract_user_id_from_token(headers: &HeaderMap) -> Result<Uuid, (StatusCode, Json<Value>)> {
    let auth_header = headers
        .get("authorization")
        .ok_or_else(|| {
            (
                StatusCode::UNAUTHORIZED,
                Json(ApiResponse::error(
                    ErrorCode::TOKEN_NOT_FOUND,
                    ErrorMessage::TOKEN_NOT_FOUND,
                )),
            )
        })?
        .to_str()
        .map_err(|_| {
            (
                StatusCode::UNAUTHORIZED,
                Json(ApiResponse::error(
                    ErrorCode::TOKEN_INVALID,
                    ErrorMessage::TOKEN_INVALID_OR_EXPIRED,
                )),
            )
        })?;

    let token = auth_header.strip_prefix("Bearer ").ok_or_else(|| {
        (
            StatusCode::UNAUTHORIZED,
            Json(ApiResponse::error(
                ErrorCode::TOKEN_INVALID,
                ErrorMessage::TOKEN_INVALID_OR_EXPIRED,
            )),
        )
    })?;

    JwtService::extract_user_id(token).map_err(|e| {
        tracing::error!("JWT validation error: {}", e);
        (
            StatusCode::UNAUTHORIZED,
            Json(ApiResponse::error(
                ErrorCode::TOKEN_INVALID,
                ErrorMessage::TOKEN_INVALID_OR_EXPIRED,
            )),
        )
    })
}

/// Get current user profile (requires authentication)
pub async fn get_profile_handler(
    State(db): State<Arc<Database>>,
    headers: HeaderMap,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    tracing::info!("Getting user profile");

    // Extract user_id from JWT token
    let user_id = extract_user_id_from_token(&headers)?;

    match db.get_user_profile(user_id) {
        Ok(Some((user, auth_user, role_name))) => {
            // Convert database data to proto UserProfile
            let proto_user_profile = UserProfile {
                // Fields from User table
                id: user.id.to_string(),
                email: user.email,
                name: user.name,
                role_id: user.role_id.to_string(),
                avatar_path: user.avatar_path,
                created_at: user.created_at.to_rfc3339(),
                updated_at: user.updated_at.to_rfc3339(),
                deleted_at: user.deleted_at.map(|dt| dt.to_rfc3339()),
                // Fields from AuthUser table
                email_verified: auth_user.email_verified,
                last_login: auth_user.last_login.map(|dt| dt.to_rfc3339()),
                login_failure_count: auth_user.login_failure_count,
                is_login_locked: auth_user.is_login_locked,
                // Fields from Role table
                role_name,
            };

            let response = json!({
                "success": true,
                "data": proto_user_profile
            });
            Ok(Json(response))
        }
        Ok(None) => Err((
            StatusCode::NOT_FOUND,
            Json(ApiResponse::error(
                ErrorCode::USER_NOT_FOUND,
                ErrorMessage::USER_NOT_FOUND,
            )),
        )),
        Err(e) => {
            tracing::error!("Database error getting user profile: {}", e);
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

/// Update user profile
pub async fn update_profile_handler(
    State(db): State<Arc<Database>>,
    headers: HeaderMap,
    Json(payload): Json<UserUpdateRequest>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    tracing::info!("Updating user profile");

    // Extract user_id from JWT token
    let user_id = extract_user_id_from_token(&headers)?;

    // Validate input data
    if let Some(ref name) = payload.name {
        if name.trim().is_empty() {
            return Err((
                StatusCode::BAD_REQUEST,
                Json(ApiResponse::error(
                    ErrorCode::VALIDATION_ERROR,
                    ErrorMessage::INVALID_INPUT_DATA,
                )),
            ));
        }
    }

    match db.update_user_profile(
        user_id,
        payload.name.as_deref(),
        payload.avatar_path.as_deref(),
    ) {
        Ok(updated_user) => {
            // Convert database User to proto User
            let proto_user = User {
                id: updated_user.id.to_string(),
                email: updated_user.email,
                name: updated_user.name,
                role_id: updated_user.role_id.to_string(),
                avatar_path: updated_user.avatar_path,
                created_at: updated_user.created_at.to_rfc3339(),
                updated_at: updated_user.updated_at.to_rfc3339(),
                deleted_at: updated_user.deleted_at.map(|dt| dt.to_rfc3339()),
            };

            let response = json!({
                "success": true,
                "data": proto_user
            });
            Ok(Json(response))
        }
        Err(e) => {
            tracing::error!("Database error updating user profile: {}", e);
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
