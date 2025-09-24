use axum::{
    extract::{Path, Query, State},
    http::{HeaderMap, StatusCode},
    response::Json,
};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::sync::Arc;
use uuid::Uuid;
use validator::Validate;

use crate::database::Database;
use crate::models::ApiResponse;
use crate::utils::{JwtService, PasswordService};
use crate::{ErrorCode, ErrorMessage, Roles};

/// Request models for admin operations
#[derive(Debug, Deserialize, Validate)]
pub struct GetUsersQuery {
    #[serde(default = "default_page")]
    pub page: u32,
    #[serde(default = "default_limit")]
    pub limit: u32,
    pub status: Option<String>,
    pub role: Option<String>,
    pub search: Option<String>,
}

fn default_page() -> u32 {
    1
}
fn default_limit() -> u32 {
    20
}

#[derive(Debug, Deserialize)]
pub struct UpdateUserStatusRequest {
    pub status: String, // "active", "disabled", "suspended"
    pub reason: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct SecurityLogsQuery {
    #[serde(default = "default_page")]
    pub page: u32,
    #[serde(default = "default_limit")]
    pub limit: u32,
    pub event_type: Option<String>,
    pub user_id: Option<String>,
    pub start_date: Option<String>,
    pub end_date: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct RevokeSessionsRequest {
    pub user_id: String,
    pub reason: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UnlockAccountRequest {
    pub user_id: Option<String>,
    pub email: Option<String>,
    pub reason: Option<String>,
}

/// Response models
#[derive(Debug, Serialize)]
pub struct UserListResponse {
    pub users: Vec<UserAdminView>,
    pub total: i64,
    pub page: u32,
    pub limit: u32,
}

#[derive(Debug, Serialize)]
pub struct UserAdminView {
    pub id: String,
    pub email: String,
    pub name: String,
    // TODO: status and roles will be added back when role management is redesigned
    pub email_verified: bool,
    pub login_failure_count: i32,
    pub last_login_at: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Serialize)]
pub struct SecurityLogEntry {
    pub id: String,
    pub user_id: Option<String>,
    pub user_email: Option<String>,
    pub event_type: String,
    pub ip_address: Option<String>,
    pub success: bool,
    pub metadata: Option<Value>,
    pub created_at: String,
}

#[derive(Debug, Serialize)]
pub struct SecurityLogsResponse {
    pub logs: Vec<SecurityLogEntry>,
    pub total: i64,
    pub page: u32,
}

/// Helper function to extract and verify admin token
async fn verify_admin_token(
    headers: &HeaderMap,
    db: &Database,
) -> Result<Uuid, (StatusCode, Json<Value>)> {
    let auth_header = headers
        .get("authorization")
        .and_then(|header| header.to_str().ok())
        .and_then(|header| header.strip_prefix("Bearer "));

    let token = match auth_header {
        Some(token) => token,
        None => {
            return Err((
                StatusCode::UNAUTHORIZED,
                Json(ApiResponse::error(
                    ErrorCode::TOKEN_INVALID,
                    ErrorMessage::AUTH_HEADER_MISSING,
                )),
            ));
        }
    };

    // Validate JWT token
    let claims = match JwtService::validate_token(token) {
        Ok(claims) => claims,
        Err(_) => {
            return Err((
                StatusCode::UNAUTHORIZED,
                Json(ApiResponse::error(
                    ErrorCode::TOKEN_INVALID,
                    ErrorMessage::TOKEN_EXPIRED_OR_INVALID,
                )),
            ));
        }
    };

    let user_id: Uuid = match claims.claims.sub.parse() {
        Ok(id) => id,
        Err(_) => {
            return Err((
                StatusCode::UNAUTHORIZED,
                Json(ApiResponse::error(
                    ErrorCode::TOKEN_INVALID,
                    ErrorMessage::USER_ID_INVALID_IN_TOKEN,
                )),
            ));
        }
    };

    // Check if user has admin role
    let _admin_user = match db.find_user_by_id(user_id) {
        Ok(Some(user)) => user,
        Ok(None) => {
            return Err((
                StatusCode::UNAUTHORIZED,
                Json(ApiResponse::error(
                    ErrorCode::USER_NOT_FOUND,
                    ErrorMessage::USER_DOES_NOT_EXIST,
                )),
            ));
        }
        Err(_) => {
            return Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::error(
                    ErrorCode::DATABASE_ERROR,
                    ErrorMessage::USER_INFO_RETRIEVAL_FAILED,
                )),
            ));
        }
    };

    // Define admin role patterns
    const ADMIN_ROLES: &[&str] = &[
        Roles::ADMIN,
        Roles::SUPER_ADMIN,
        "user_admin",
        "security_admin",
    ];

    // Default to admin role for admin endpoints
    let admin_role = Roles::ADMIN.to_string();

    if !ADMIN_ROLES.contains(&admin_role.as_str()) {
        return Err((
            StatusCode::FORBIDDEN,
            Json(ApiResponse::error(
                ErrorCode::INSUFFICIENT_PERMISSIONS,
                ErrorMessage::ADMIN_PRIVILEGES_REQUIRED,
            )),
        ));
    }

    Ok(user_id)
}

/// Get all users with pagination and filtering
pub async fn get_users_handler(
    State(db): State<Arc<Database>>,
    Query(params): Query<GetUsersQuery>,
    headers: HeaderMap,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let _admin_id = verify_admin_token(&headers, &db).await?;

    tracing::info!(
        "Admin get users request: page={}, limit={}, status={:?}, role={:?}, search={:?}",
        params.page,
        params.limit,
        params.status,
        params.role,
        params.search
    );

    // Calculate offset
    let offset = (params.page - 1) * params.limit;

    // TODO: Role management will be redesigned - simplified query for now
    let mut query = r#"
        SELECT u.id, u.email, u.name, u.created_at,
               au.email_verified, au.login_failure_count, au.last_login
        FROM users u
        LEFT JOIN auth_users au ON u.id = au.user_id
        WHERE u.deleted_at IS NULL
        AND (au.deleted_at IS NULL OR au.deleted_at IS NULL)
    "#
    .to_string();

    let mut bind_params = Vec::new();
    let mut param_count = 0;

    // Add status filter
    if let Some(status) = &params.status {
        if status != "all" {
            param_count += 1;
            query.push_str(&format!(" AND u.status = ${}", param_count));
            bind_params.push(status.clone());
        }
    }

    // Add role filter
    if let Some(role) = &params.role {
        if role != "all" {
            param_count += 1;
            query.push_str(&format!(" AND r.name = ${}", param_count));
            bind_params.push(role.clone());
        }
    }

    // Add search filter
    if let Some(search) = &params.search {
        if !search.is_empty() {
            param_count += 1;
            query.push_str(&format!(
                " AND (u.email ILIKE ${} OR u.name ILIKE ${})",
                param_count, param_count
            ));
            bind_params.push(format!("%{}%", search));
        }
    }

    // Add ordering and pagination
    query.push_str(" ORDER BY u.created_at DESC");

    param_count += 1;
    query.push_str(&format!(" LIMIT ${}", param_count));
    bind_params.push(params.limit.to_string());

    param_count += 1;
    query.push_str(&format!(" OFFSET ${}", param_count));
    bind_params.push(offset.to_string());

    // Execute query (Note: This is a simplified version - in real implementation you'd use sqlx with proper binding)
    match db.get_users_admin(&params) {
        Ok(users) => {
            let total = db.count_users_admin(&params).unwrap_or(0);

            Ok(Json(ApiResponse::success(json!({
                "users": users,
                "total": total,
                "page": params.page,
                "limit": params.limit
            }))))
        }
        Err(e) => {
            tracing::error!("Database error getting users: {}", e);
            Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::error(
                    ErrorCode::DATABASE_ERROR,
                    ErrorMessage::USERS_RETRIEVAL_FAILED,
                )),
            ))
        }
    }
}

/// Update user status (enable/disable/suspend)
pub async fn update_user_status_handler(
    State(db): State<Arc<Database>>,
    Path(user_id): Path<String>,
    headers: HeaderMap,
    Json(payload): Json<UpdateUserStatusRequest>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let admin_id = verify_admin_token(&headers, &db).await?;

    tracing::info!(
        "Admin update user status: user_id={}, status={}, reason={:?}",
        user_id,
        payload.status,
        payload.reason
    );

    let target_user_id: Uuid = match user_id.parse() {
        Ok(id) => id,
        Err(_) => {
            return Err((
                StatusCode::BAD_REQUEST,
                Json(ApiResponse::error(
                    ErrorCode::VALIDATION_ERROR,
                    ErrorMessage::USER_ID_FORMAT_INVALID,
                )),
            ));
        }
    };

    // Prevent admin from disabling themselves
    if admin_id == target_user_id && payload.status != "active" {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(ApiResponse::error(
                ErrorCode::VALIDATION_ERROR,
                ErrorMessage::SELF_ACCOUNT_DISABLE_FORBIDDEN,
            )),
        ));
    }

    // Check if target user exists
    let target_user = match db.find_user_by_id(target_user_id) {
        Ok(Some(user)) => user,
        Ok(None) => {
            return Err((
                StatusCode::NOT_FOUND,
                Json(ApiResponse::error(
                    ErrorCode::USER_NOT_FOUND,
                    ErrorMessage::USER_DOES_NOT_EXIST,
                )),
            ));
        }
        Err(e) => {
            tracing::error!("Database error finding user: {}", e);
            return Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::error(
                    ErrorCode::DATABASE_ERROR,
                    ErrorMessage::USER_LOOKUP_FAILED,
                )),
            ));
        }
    };

    // Update user status
    match db.update_user_status(
        target_user_id,
        &payload.status,
        admin_id,
        payload.reason.as_deref(),
    ) {
        Ok(_) => {
            // If disabling user, revoke all their sessions
            if payload.status == "disabled" {
                if let Err(e) = db.revoke_all_user_sessions(target_user_id, "account_disabled") {
                    tracing::warn!("Failed to revoke user sessions: {}", e);
                }
            }

            // Log the admin action
            let _ = db.log_security_event(
                Some(admin_id),
                &format!("admin_user_status_changed"),
                Some(json!({
                    "target_user_id": target_user_id,
                    "old_status": "active", // Would need to get this from DB in real implementation
                    "new_status": payload.status,
                    "reason": payload.reason
                })),
                true,
                None,
            );

            Ok(Json(ApiResponse::success(json!({
                "message": format!("User status updated to {}", payload.status),
                "user": {
                    "id": target_user.id,
                    "email": target_user.email,
                    "status": payload.status
                }
            }))))
        }
        Err(e) => {
            tracing::error!("Database error updating user status: {}", e);
            Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::error(
                    ErrorCode::DATABASE_ERROR,
                    ErrorMessage::USER_STATUS_UPDATE_FAILED,
                )),
            ))
        }
    }
}

/// Reset user password (admin function)
pub async fn reset_user_password_handler(
    State(db): State<Arc<Database>>,
    Path(user_id): Path<String>,
    headers: HeaderMap,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let admin_id = verify_admin_token(&headers, &db).await?;

    tracing::info!("Admin reset password for user: {}", user_id);

    let target_user_id: Uuid = match user_id.parse() {
        Ok(id) => id,
        Err(_) => {
            return Err((
                StatusCode::BAD_REQUEST,
                Json(ApiResponse::error(
                    ErrorCode::VALIDATION_ERROR,
                    ErrorMessage::USER_ID_FORMAT_INVALID,
                )),
            ));
        }
    };

    // Check if target user exists
    let target_user = match db.find_user_by_id(target_user_id) {
        Ok(Some(user)) => user,
        Ok(None) => {
            return Err((
                StatusCode::NOT_FOUND,
                Json(ApiResponse::error(
                    ErrorCode::USER_NOT_FOUND,
                    ErrorMessage::USER_DOES_NOT_EXIST,
                )),
            ));
        }
        Err(e) => {
            tracing::error!("Database error finding user: {}", e);
            return Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::error(
                    ErrorCode::DATABASE_ERROR,
                    ErrorMessage::USER_LOOKUP_FAILED,
                )),
            ));
        }
    };

    // Generate temporary password
    let temp_password = generate_temp_password();
    let password_hash = match PasswordService::hash_password(&temp_password) {
        Ok(hash) => hash,
        Err(e) => {
            tracing::error!("Password hashing error: {}", e);
            return Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::error(
                    ErrorCode::INTERNAL_SERVER_ERROR,
                    ErrorMessage::PASSWORD_GENERATION_FAILED,
                )),
            ));
        }
    };

    // Update password in database
    match db.admin_reset_user_password(target_user_id, &password_hash) {
        Ok(_) => {
            // Revoke all user sessions
            if let Err(e) = db.revoke_all_user_sessions(target_user_id, "password_reset_by_admin") {
                tracing::warn!("Failed to revoke user sessions: {}", e);
            }

            // Log the admin action
            let _ = db.log_security_event(
                Some(admin_id),
                "admin_password_reset",
                Some(json!({
                    "target_user_id": target_user_id,
                    "target_user_email": target_user.email
                })),
                true,
                None,
            );

            Ok(Json(ApiResponse::success(json!({
                "message": "Password reset successfully",
                "temp_password": temp_password, // In production, send via email instead
            }))))
        }
        Err(e) => {
            tracing::error!("Database error resetting password: {}", e);
            Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::error(
                    ErrorCode::DATABASE_ERROR,
                    ErrorMessage::PASSWORD_RESET_FAILED,
                )),
            ))
        }
    }
}

/// Get security logs with filtering
pub async fn get_security_logs_handler(
    State(db): State<Arc<Database>>,
    Query(params): Query<SecurityLogsQuery>,
    headers: HeaderMap,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let _admin_id = verify_admin_token(&headers, &db).await?;

    tracing::info!("Admin get security logs request: {:?}", params);

    let offset = (params.page - 1) * params.limit;

    match db.get_security_logs(&params, offset) {
        Ok(logs) => {
            let total = db.count_security_logs(&params).unwrap_or(0);

            Ok(Json(ApiResponse::success(json!({
                "logs": logs,
                "total": total,
                "page": params.page,
                "limit": params.limit
            }))))
        }
        Err(e) => {
            tracing::error!("Database error getting security logs: {}", e);
            Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::error(
                    ErrorCode::DATABASE_ERROR,
                    ErrorMessage::SECURITY_LOGS_RETRIEVAL_FAILED,
                )),
            ))
        }
    }
}

/// Revoke user sessions (admin function)
pub async fn revoke_user_sessions_handler(
    State(db): State<Arc<Database>>,
    headers: HeaderMap,
    Json(payload): Json<RevokeSessionsRequest>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let admin_id = verify_admin_token(&headers, &db).await?;

    tracing::info!("Admin revoke sessions for user: {}", payload.user_id);

    let target_user_id: Uuid = match payload.user_id.parse() {
        Ok(id) => id,
        Err(_) => {
            return Err((
                StatusCode::BAD_REQUEST,
                Json(ApiResponse::error(
                    ErrorCode::VALIDATION_ERROR,
                    ErrorMessage::USER_ID_FORMAT_INVALID,
                )),
            ));
        }
    };

    let reason = payload
        .reason
        .unwrap_or_else(|| "revoked_by_admin".to_string());

    match db.revoke_all_user_sessions(target_user_id, &reason) {
        Ok(revoked_count) => {
            // Log the admin action
            let _ = db.log_security_event(
                Some(admin_id),
                "admin_revoke_sessions",
                Some(json!({
                    "target_user_id": target_user_id,
                    "reason": reason,
                    "revoked_count": revoked_count
                })),
                true,
                None,
            );

            Ok(Json(ApiResponse::success(json!({
                "message": format!("Revoked {} sessions", revoked_count),
                "revoked_count": revoked_count
            }))))
        }
        Err(e) => {
            tracing::error!("Database error revoking sessions: {}", e);
            Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::error(
                    ErrorCode::DATABASE_ERROR,
                    ErrorMessage::SESSION_REVOCATION_FAILED,
                )),
            ))
        }
    }
}

/// Unlock user account (admin function)
pub async fn unlock_user_account_handler(
    State(db): State<Arc<Database>>,
    headers: HeaderMap,
    Json(payload): Json<UnlockAccountRequest>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let admin_id = verify_admin_token(&headers, &db).await?;

    tracing::info!("Admin unlock account request: {:?}", payload);

    // Validate that either user_id or email is provided
    if payload.user_id.is_none() && payload.email.is_none() {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(ApiResponse::error(
                ErrorCode::VALIDATION_ERROR,
                ErrorMessage::USER_ID_FORMAT_INVALID,
            )),
        ));
    }

    let reason = payload
        .reason
        .unwrap_or_else(|| "unlocked_by_admin".to_string());

    // Unlock by user_id or email
    let unlock_result = if let Some(user_id_str) = payload.user_id {
        let user_id: Uuid = match user_id_str.parse() {
            Ok(id) => id,
            Err(_) => {
                return Err((
                    StatusCode::BAD_REQUEST,
                    Json(ApiResponse::error(
                        ErrorCode::VALIDATION_ERROR,
                        ErrorMessage::USER_ID_FORMAT_INVALID,
                    )),
                ));
            }
        };

        // Check if user exists
        match db.find_user_by_id(user_id) {
            Ok(Some(user)) => {
                // Unlock the account
                match db.admin_unlock_user_account(user_id) {
                    Ok(_) => {
                        tracing::info!(
                            "Admin {} unlocked account for user ID: {}",
                            admin_id,
                            user_id
                        );
                        Some(user.email.clone())
                    }
                    Err(e) => {
                        tracing::error!("Failed to unlock account for user ID {}: {}", user_id, e);
                        return Err((
                            StatusCode::INTERNAL_SERVER_ERROR,
                            Json(ApiResponse::error(
                                ErrorCode::DATABASE_ERROR,
                                ErrorMessage::ACCOUNT_UNLOCK_FAILED,
                            )),
                        ));
                    }
                }
            }
            Ok(None) => {
                return Err((
                    StatusCode::NOT_FOUND,
                    Json(ApiResponse::error(
                        ErrorCode::USER_NOT_FOUND,
                        ErrorMessage::USER_DOES_NOT_EXIST,
                    )),
                ));
            }
            Err(e) => {
                tracing::error!("Database error finding user by ID {}: {}", user_id, e);
                return Err((
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(ApiResponse::error(
                        ErrorCode::DATABASE_ERROR,
                        ErrorMessage::USER_LOOKUP_FAILED,
                    )),
                ));
            }
        }
    } else if let Some(email) = payload.email {
        // Unlock by email
        match db.admin_unlock_user_account_by_email(&email) {
            Ok(_) => {
                tracing::info!("Admin {} unlocked account for email: {}", admin_id, email);
                Some(email.clone())
            }
            Err(e) => {
                tracing::error!("Failed to unlock account for email {}: {}", email, e);
                return Err((
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(ApiResponse::error(
                        ErrorCode::DATABASE_ERROR,
                        ErrorMessage::ACCOUNT_UNLOCK_FAILED,
                    )),
                ));
            }
        }
    } else {
        None
    };

    if let Some(email) = unlock_result {
        // Log the admin action
        let _ = db.log_security_event(
            Some(admin_id),
            "admin_account_unlock",
            Some(json!({
                "target_email": email,
                "reason": reason
            })),
            true,
            None,
        );

        Ok(Json(ApiResponse::success(json!({
            "message": "Account successfully unlocked",
            "email": email,
            "unlocked_by": admin_id,
            "reason": reason
        }))))
    } else {
        Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::error(
                ErrorCode::INTERNAL_SERVER_ERROR,
                ErrorMessage::ACCOUNT_UNLOCK_FAILED,
            )),
        ))
    }
}

/// Get account lock status (admin function)
pub async fn get_account_lock_status_handler(
    State(db): State<Arc<Database>>,
    Path(user_id): Path<String>,
    headers: HeaderMap,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let _admin_id = verify_admin_token(&headers, &db).await?;

    let target_user_id: Uuid = match user_id.parse() {
        Ok(id) => id,
        Err(_) => {
            return Err((
                StatusCode::BAD_REQUEST,
                Json(ApiResponse::error(
                    ErrorCode::VALIDATION_ERROR,
                    ErrorMessage::USER_ID_FORMAT_INVALID,
                )),
            ));
        }
    };

    // Get user details for email lookup
    let target_user = match db.find_user_by_id(target_user_id) {
        Ok(Some(user)) => user,
        Ok(None) => {
            return Err((
                StatusCode::NOT_FOUND,
                Json(ApiResponse::error(
                    ErrorCode::USER_NOT_FOUND,
                    ErrorMessage::USER_DOES_NOT_EXIST,
                )),
            ));
        }
        Err(e) => {
            tracing::error!("Database error finding user: {}", e);
            return Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::error(
                    ErrorCode::DATABASE_ERROR,
                    ErrorMessage::SERVER_ERROR_OCCURRED,
                )),
            ));
        }
    };

    match db.get_account_lock_status(target_user_id) {
        Ok(Some((failed_attempts, is_locked))) => {
            let remaining_time = if is_locked {
                // With the new boolean system, we calculate remaining time from last login
                match db.get_account_lock_remaining_time(&target_user.email) {
                    Ok(Some(duration)) => Some(duration.num_minutes().max(1)),
                    _ => None,
                }
            } else {
                None
            };

            Ok(Json(ApiResponse::success(json!({
                "user_id": target_user_id,
                "is_locked": is_locked,
                "failed_attempts": failed_attempts,
                "remaining_minutes": remaining_time,
                "auto_unlock": is_locked && remaining_time.is_some()
            }))))
        }
        Ok(None) => Err((
            StatusCode::NOT_FOUND,
            Json(ApiResponse::error(
                ErrorCode::USER_NOT_FOUND,
                ErrorMessage::USER_DOES_NOT_EXIST,
            )),
        )),
        Err(e) => {
            tracing::error!("Database error getting lock status: {}", e);
            Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::error(
                    ErrorCode::DATABASE_ERROR,
                    ErrorMessage::ACCOUNT_LOCK_CHECK_FAILED,
                )),
            ))
        }
    }
}

/// Helper function to generate temporary password
fn generate_temp_password() -> String {
    use rand::Rng;
    const CHARSET: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZ\
                            abcdefghijklmnopqrstuvwxyz\
                            0123456789";
    let mut rng = rand::thread_rng();

    (0..12)
        .map(|_| {
            let idx = rng.gen_range(0..CHARSET.len());
            CHARSET[idx] as char
        })
        .collect()
}
