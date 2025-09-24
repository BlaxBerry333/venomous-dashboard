use axum::{extract::State, http::StatusCode, response::Json};
use serde_json::{json, Value};
use std::sync::Arc;

use crate::database::Database;
use crate::models::ApiResponse;
use crate::proto_generated::*;
use crate::utils::{JwtService, PasswordService, ProtoValidator};
use crate::{ErrorCode, ErrorMessage, Roles};

/// Handler for user signup
pub async fn signup_handler(
    State(db): State<Arc<Database>>,
    Json(payload): Json<AuthSignupRequest>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    tracing::info!(
        "Signup request received for user: {}. Creating account and issuing token.",
        payload.email
    );

    // Validate input
    if let Err(_) = ProtoValidator::validate_signup_request(&payload) {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(ApiResponse::error(
                ErrorCode::VALIDATION_ERROR,
                ErrorMessage::INVALID_INPUT_DATA,
            )),
        ));
    }

    // Validate password strength
    if let Err(_) = PasswordService::validate_password_strength(&payload.password) {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(ApiResponse::error(
                ErrorCode::WEAK_PASSWORD,
                ErrorMessage::PASSWORD_TOO_WEAK,
            )),
        ));
    }

    // Check if user already exists
    match db.email_exists(&payload.email) {
        Ok(true) => {
            return Err((
                StatusCode::CONFLICT,
                Json(ApiResponse::error(
                    ErrorCode::USER_ALREADY_EXISTS,
                    ErrorMessage::EMAIL_ALREADY_REGISTERED,
                )),
            ));
        }
        Ok(false) => {}
        Err(e) => {
            tracing::error!("Database error checking email existence: {}", e);
            return Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::error(
                    ErrorCode::DATABASE_ERROR,
                    ErrorMessage::SERVER_ERROR_OCCURRED,
                )),
            ));
        }
    }

    // Hash password
    let password_hash = match PasswordService::hash_password(&payload.password) {
        Ok(hash) => hash,
        Err(e) => {
            tracing::error!("Password hashing error: {}", e);
            return Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::error(
                    ErrorCode::INTERNAL_SERVER_ERROR,
                    ErrorMessage::SERVER_ERROR_OCCURRED,
                )),
            ));
        }
    };

    // Create main user record (business information only)
    let user = match db.create_user(&payload.email, &payload.name) {
        Ok(user) => user,
        Err(e) => {
            tracing::error!("Database error creating user: {}", e);
            return Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::error(
                    ErrorCode::DATABASE_ERROR,
                    ErrorMessage::SERVER_ERROR_OCCURRED,
                )),
            ));
        }
    };

    // Create auth user record
    if let Err(e) = db.create_auth_user(user.id, &payload.email, &password_hash) {
        tracing::error!("Database error creating auth user: {}", e);
        return Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::error(
                ErrorCode::DATABASE_ERROR,
                ErrorMessage::SERVER_ERROR_OCCURRED,
            )),
        ));
    }

    // Role is now set directly in the user table during creation
    // Get user role
    let role = match db.get_user_role(user.id) {
        Ok(r) => r.unwrap_or(Roles::USER.to_string()),
        Err(_) => Roles::USER.to_string(),
    };

    // Generate JWT token
    let token = match JwtService::generate_token(user.id, &user.email, &role) {
        Ok(token) => token,
        Err(e) => {
            tracing::error!("JWT generation error: {}", e);
            return Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::error(
                    ErrorCode::JWT_ERROR,
                    ErrorMessage::SERVER_ERROR_OCCURRED,
                )),
            ));
        }
    };

    tracing::info!("User {} successfully signed up", payload.email);

    Ok(Json(ApiResponse::success(json!({
        "token": token,
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "created_at": user.created_at
        }
    }))))
}

/// Handler for user signin
pub async fn signin_handler(
    State(db): State<Arc<Database>>,
    Json(payload): Json<AuthSigninRequest>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    tracing::info!(
        "Signin request received for user: {}. Validating credentials.",
        payload.email
    );

    // Validate input
    if let Err(_) = ProtoValidator::validate_signin_request(&payload) {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(ApiResponse::error(
                ErrorCode::VALIDATION_ERROR,
                ErrorMessage::INVALID_INPUT_DATA,
            )),
        ));
    }

    // Find user by email
    let user = match db.find_user_by_email(&payload.email) {
        Ok(Some(user)) => user,
        Ok(None) => {
            // Increment failed attempts for non-existent users to prevent timing attacks
            let _ = db.increment_failed_login_attempts(&payload.email);
            return Err((
                StatusCode::UNAUTHORIZED,
                Json(ApiResponse::error(
                    ErrorCode::INVALID_CREDENTIALS,
                    ErrorMessage::CREDENTIALS_INVALID,
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

    // Find auth user data
    let auth_user = match db.find_auth_user_by_email(&payload.email) {
        Ok(Some(auth_user)) => auth_user,
        Ok(None) => {
            return Err((
                StatusCode::UNAUTHORIZED,
                Json(ApiResponse::error(
                    ErrorCode::INVALID_CREDENTIALS,
                    ErrorMessage::CREDENTIALS_INVALID,
                )),
            ));
        }
        Err(e) => {
            tracing::error!("Database error finding auth user: {}", e);
            return Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::error(
                    ErrorCode::DATABASE_ERROR,
                    ErrorMessage::SERVER_ERROR_OCCURRED,
                )),
            ));
        }
    };

    // Check if account is locked (with automatic unlock logic)
    match db.is_account_locked(&payload.email) {
        Ok(true) => {
            // Account is still locked, check remaining time
            let remaining_time = db
                .get_account_lock_remaining_time(&payload.email)
                .unwrap_or(None);

            match remaining_time {
                Some(duration) => {
                    let minutes_remaining = duration.num_minutes().max(1); // At least 1 minute
                    tracing::warn!(
                        "Account locked for user: {} (unlock in {} minutes)",
                        payload.email,
                        minutes_remaining
                    );
                    return Err((
                        StatusCode::LOCKED,
                        Json(ApiResponse::error(
                            ErrorCode::ACCOUNT_LOCKED,
                            &format!(
                                "{}",
                                ErrorMessage::ACCOUNT_LOCKED_WITH_COUNTDOWN
                                    .replace("{}", &minutes_remaining.to_string())
                            ),
                        )),
                    ));
                }
                None => {
                    tracing::warn!("Account permanently locked for user: {}", payload.email);
                    return Err((
                        StatusCode::LOCKED,
                        Json(ApiResponse::error(
                            ErrorCode::ACCOUNT_LOCKED,
                            ErrorMessage::ACCOUNT_LOCKED_TEMPORARILY,
                        )),
                    ));
                }
            }
        }
        Ok(false) => {
            // Account is not locked, continue with authentication
        }
        Err(e) => {
            tracing::error!("Error checking account lock status: {}", e);
            return Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::error(
                    ErrorCode::DATABASE_ERROR,
                    ErrorMessage::SERVER_ERROR_OCCURRED,
                )),
            ));
        }
    }

    // Verify password
    match PasswordService::verify_password(&payload.password, &auth_user.password_hash) {
        Ok(true) => {
            // Password is correct, reset failed attempts
            if let Err(e) = db.reset_failed_login_attempts(&payload.email) {
                tracing::warn!("Could not reset failed login attempts: {}", e);
            }
        }
        Ok(false) => {
            // Password is incorrect, increment failed attempts
            if let Err(e) = db.increment_failed_login_attempts(&payload.email) {
                tracing::warn!("Could not increment failed login attempts: {}", e);
            }
            return Err((
                StatusCode::UNAUTHORIZED,
                Json(ApiResponse::error(
                    ErrorCode::INVALID_CREDENTIALS,
                    ErrorMessage::CREDENTIALS_INVALID,
                )),
            ));
        }
        Err(e) => {
            tracing::error!("Password verification error: {}", e);
            return Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::error(
                    ErrorCode::INTERNAL_SERVER_ERROR,
                    ErrorMessage::SERVER_ERROR_OCCURRED,
                )),
            ));
        }
    }

    // Get user role
    let role = match db.get_user_role(user.id) {
        Ok(r) => r.unwrap_or(Roles::USER.to_string()),
        Err(_) => Roles::USER.to_string(),
    };

    // Generate JWT token
    let token = match JwtService::generate_token(user.id, &user.email, &role) {
        Ok(token) => token,
        Err(e) => {
            tracing::error!("JWT generation error: {}", e);
            return Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::error(
                    ErrorCode::JWT_ERROR,
                    ErrorMessage::SERVER_ERROR_OCCURRED,
                )),
            ));
        }
    };

    // Update last login
    if let Err(e) = db.update_last_login(user.id) {
        tracing::warn!("Could not update last login time: {}", e);
    }

    tracing::info!("User {} successfully signed in", payload.email);

    Ok(Json(ApiResponse::success(json!({
        "token": token,
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "role": role,
            "last_login": auth_user.last_login
        }
    }))))
}

/// Handler for user logout
pub async fn logout_handler(Json(payload): Json<AuthLogoutRequest>) -> Json<Value> {
    tracing::info!("Logout request received. Token: {:?}", payload.token);

    // In a production system, you might want to:
    // 1. Add token to a blacklist/revocation list
    // 2. Clean up any related sessions
    // 3. Log the logout event with user info

    // For now, we'll just validate the token exists
    match JwtService::validate_token(&payload.token) {
        Ok(_) => {
            tracing::info!("User successfully logged out");
            Json(ApiResponse::success(json!(null)))
        }
        Err(_) => {
            // Even if token is invalid, we'll return success
            // to avoid leaking information about token validity
            Json(ApiResponse::success(json!(null)))
        }
    }
}
