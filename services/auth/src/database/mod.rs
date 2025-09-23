use anyhow::Result;
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::r2d2::{self, ConnectionManager, Pool};
use std::env;
use uuid::Uuid;

use crate::constants::{AccountLock, Roles};
use crate::handlers::admin::{GetUsersQuery, SecurityLogEntry, SecurityLogsQuery, UserAdminView};
use crate::models::database::{AuthUser, NewAuthUser, NewUser, User};
use crate::schema::{auth_users, roles, users};

pub type DbPool = Pool<ConnectionManager<PgConnection>>;
pub type DbConnection = r2d2::PooledConnection<ConnectionManager<PgConnection>>;

/// Database service for managing connections and operations
pub struct Database {
    pub pool: DbPool,
}

impl Database {
    /// Create new database connection pool
    pub fn new() -> Result<Self> {
        let database_url =
            env::var("DATABASE_URL").expect("DATABASE_URL environment variable must be set");

        let manager = ConnectionManager::<PgConnection>::new(database_url);
        let pool = Pool::builder().max_size(15).build(manager)?;

        Ok(Database { pool })
    }

    /// Get a connection from the pool
    pub fn get_connection(&self) -> Result<DbConnection> {
        self.pool.get().map_err(|e| anyhow::anyhow!(e))
    }

    /// Create a new user (main user table - business information only)
    pub fn create_user(&self, email: &str, name: &str) -> Result<User> {
        let mut conn = self.get_connection()?;

        // Get default user role ID
        let default_role_id = self
            .get_role_id_by_name(Roles::USER)?
            .ok_or_else(|| anyhow::anyhow!("Default user role not found"))?;

        let new_user = NewUser {
            email: email.to_string(),
            name: name.to_string(),
            avatar_path: None,
            role_id: default_role_id,
        };

        let user = diesel::insert_into(users::table)
            .values(&new_user)
            .returning(User::as_returning())
            .get_result(&mut conn)?;

        Ok(user)
    }

    /// Create auth user (authentication data)
    pub fn create_auth_user(
        &self,
        user_id: Uuid,
        email: &str,
        password_hash: &str,
    ) -> Result<AuthUser> {
        let mut conn = self.get_connection()?;

        let new_auth_user = NewAuthUser {
            user_id,
            email: email.to_string(),
            password_hash: password_hash.to_string(),
            email_verified: false,
        };

        let auth_user = diesel::insert_into(auth_users::table)
            .values(&new_auth_user)
            .returning(AuthUser::as_returning())
            .get_result(&mut conn)?;

        Ok(auth_user)
    }

    /// Find user by email (excluding soft deleted)
    pub fn find_user_by_email(&self, email: &str) -> Result<Option<User>> {
        let mut conn = self.get_connection()?;

        let user = users::table
            .filter(users::email.eq(email))
            .filter(users::deleted_at.is_null())
            .first::<User>(&mut conn)
            .optional()?;

        Ok(user)
    }

    /// Find auth user by email (excluding soft deleted)
    pub fn find_auth_user_by_email(&self, email: &str) -> Result<Option<AuthUser>> {
        let mut conn = self.get_connection()?;

        let auth_user = auth_users::table
            .filter(auth_users::email.eq(email))
            .filter(auth_users::deleted_at.is_null())
            .first::<AuthUser>(&mut conn)
            .optional()?;

        Ok(auth_user)
    }

    /// Update user last login (successful login)
    pub fn update_last_login(&self, user_id: Uuid) -> Result<()> {
        let mut conn = self.get_connection()?;

        diesel::update(
            auth_users::table
                .filter(auth_users::user_id.eq(user_id))
                .filter(auth_users::deleted_at.is_null()),
        )
        .set(auth_users::last_login.eq(Some(Utc::now())))
        .execute(&mut conn)?;

        Ok(())
    }

    /// Check if email exists (excluding soft deleted)
    pub fn email_exists(&self, email: &str) -> Result<bool> {
        let mut conn = self.get_connection()?;

        let count = users::table
            .filter(users::email.eq(email))
            .filter(users::deleted_at.is_null())
            .count()
            .get_result::<i64>(&mut conn)?;

        Ok(count > 0)
    }

    /// Get role ID by role name
    pub fn get_role_id_by_name(&self, role_name: &str) -> Result<Option<Uuid>> {
        let mut conn = self.get_connection()?;

        let role_id = roles::table
            .filter(roles::name.eq(role_name))
            .filter(roles::deleted_at.is_null())
            .select(roles::id)
            .first::<Uuid>(&mut conn)
            .optional()?;

        Ok(role_id)
    }

    /// Get user role by user ID
    pub fn get_user_role(&self, user_id: Uuid) -> Result<Option<String>> {
        let mut conn = self.get_connection()?;

        let role_name = users::table
            .inner_join(roles::table.on(users::role_id.eq(roles::id)))
            .filter(users::id.eq(user_id))
            .filter(users::deleted_at.is_null())
            .filter(roles::deleted_at.is_null())
            .select(roles::name)
            .first::<String>(&mut conn)
            .optional()?;

        Ok(role_name)
    }

    /// Get user by ID (excluding soft deleted)
    pub fn find_user_by_id(&self, user_id: Uuid) -> Result<Option<User>> {
        let mut conn = self.get_connection()?;

        let user = users::table
            .filter(users::id.eq(user_id))
            .filter(users::deleted_at.is_null())
            .first::<User>(&mut conn)
            .optional()?;

        Ok(user)
    }

    /// Update failed login attempts and lock if threshold is reached
    pub fn increment_failed_login_attempts(&self, email: &str) -> Result<()> {
        let mut conn = self.get_connection()?;

        // Get current failed attempts count
        let current_attempts: i32 = auth_users::table
            .filter(auth_users::email.eq(email))
            .filter(auth_users::deleted_at.is_null())
            .select(auth_users::login_failure_count)
            .first(&mut conn)
            .unwrap_or(0);

        let new_attempts = current_attempts + 1;
        let now = Utc::now();

        // Lock account after max failed attempts
        const MAX_FAILED_ATTEMPTS: i32 = AccountLock::MAX_FAILED_ATTEMPTS;
        let is_locked = new_attempts >= MAX_FAILED_ATTEMPTS;

        diesel::update(
            auth_users::table
                .filter(auth_users::email.eq(email))
                .filter(auth_users::deleted_at.is_null()),
        )
        .set((
            auth_users::login_failure_count.eq(new_attempts),
            auth_users::last_login.eq(Some(now)),
            auth_users::is_login_locked.eq(is_locked),
        ))
        .execute(&mut conn)?;

        Ok(())
    }

    /// Reset failed login attempts and clear lock time
    pub fn reset_failed_login_attempts(&self, email: &str) -> Result<()> {
        let mut conn = self.get_connection()?;

        diesel::update(
            auth_users::table
                .filter(auth_users::email.eq(email))
                .filter(auth_users::deleted_at.is_null()),
        )
        .set((
            auth_users::login_failure_count.eq(0),
            auth_users::is_login_locked.eq(false),
        ))
        .execute(&mut conn)?;

        Ok(())
    }

    /// Check if account is currently locked (considering automatic unlock based on time)
    pub fn is_account_locked(&self, email: &str) -> Result<bool> {
        let mut conn = self.get_connection()?;
        let now = Utc::now();

        let auth_user = auth_users::table
            .filter(auth_users::email.eq(email))
            .filter(auth_users::deleted_at.is_null())
            .select((
                auth_users::login_failure_count,
                auth_users::is_login_locked,
                auth_users::last_login,
            ))
            .first::<(i32, bool, Option<DateTime<Utc>>)>(&mut conn)
            .optional()?;

        match auth_user {
            Some((failed_attempts, is_locked, last_login)) => {
                // Check against max failed attempts threshold
                const MAX_FAILED_ATTEMPTS: i32 = AccountLock::MAX_FAILED_ATTEMPTS;

                if is_locked && failed_attempts >= MAX_FAILED_ATTEMPTS {
                    // Auto-unlock after configured minutes
                    const AUTO_UNLOCK_MINUTES: i64 = AccountLock::AUTO_UNLOCK_MINUTES;

                    // Check if lockout period has passed since last login attempt
                    match last_login {
                        Some(last_attempt) => {
                            let unlock_time =
                                last_attempt + chrono::Duration::minutes(AUTO_UNLOCK_MINUTES);
                            if now >= unlock_time {
                                // Lockout period has passed, automatically unlock and reset counters
                                self.reset_failed_login_attempts(email)?;
                                Ok(false) // Account is no longer locked
                            } else {
                                Ok(true) // Account is still locked
                            }
                        }
                        None => Ok(true), // No last login time, keep locked
                    }
                } else {
                    Ok(false) // Account is not locked
                }
            }
            None => Ok(false), // User doesn't exist or no auth record
        }
    }

    /// Get remaining lock time for an account
    pub fn get_account_lock_remaining_time(&self, email: &str) -> Result<Option<chrono::Duration>> {
        let mut conn = self.get_connection()?;
        let now = Utc::now();

        let auth_user = auth_users::table
            .filter(auth_users::email.eq(email))
            .filter(auth_users::deleted_at.is_null())
            .select((auth_users::is_login_locked, auth_users::last_login))
            .first::<(bool, Option<DateTime<Utc>>)>(&mut conn)
            .optional()?;

        match auth_user {
            Some((is_locked, Some(last_login))) if is_locked => {
                // Auto-unlock after configured minutes
                const AUTO_UNLOCK_MINUTES: i64 = AccountLock::AUTO_UNLOCK_MINUTES;

                let unlock_time = last_login + chrono::Duration::minutes(AUTO_UNLOCK_MINUTES);
                if now < unlock_time {
                    Ok(Some(unlock_time - now))
                } else {
                    Ok(None) // Lock time has expired
                }
            }
            _ => Ok(None), // Not locked or no last login time
        }
    }

    /// Manually unlock user account (admin function)
    pub fn admin_unlock_user_account(&self, user_id: Uuid) -> Result<()> {
        let mut conn = self.get_connection()?;

        diesel::update(
            auth_users::table
                .filter(auth_users::user_id.eq(user_id))
                .filter(auth_users::deleted_at.is_null()),
        )
        .set((
            auth_users::login_failure_count.eq(0),
            auth_users::is_login_locked.eq(false),
        ))
        .execute(&mut conn)?;

        Ok(())
    }

    /// Manually unlock user account by email (admin function)
    pub fn admin_unlock_user_account_by_email(&self, email: &str) -> Result<()> {
        let mut conn = self.get_connection()?;

        diesel::update(
            auth_users::table
                .filter(auth_users::email.eq(email))
                .filter(auth_users::deleted_at.is_null()),
        )
        .set((
            auth_users::login_failure_count.eq(0),
            auth_users::is_login_locked.eq(false),
        ))
        .execute(&mut conn)?;

        Ok(())
    }

    /// Get account lock status for admin view
    pub fn get_account_lock_status(&self, user_id: Uuid) -> Result<Option<(i32, bool)>> {
        let mut conn = self.get_connection()?;

        let result = auth_users::table
            .filter(auth_users::user_id.eq(user_id))
            .filter(auth_users::deleted_at.is_null())
            .select((auth_users::login_failure_count, auth_users::is_login_locked))
            .first::<(i32, bool)>(&mut conn)
            .optional()?;

        Ok(result)
    }

    // ========================================
    // Admin-specific database operations
    // ========================================

    /// Get users for admin panel with filtering and pagination
    pub fn get_users_admin(&self, params: &GetUsersQuery) -> Result<Vec<UserAdminView>> {
        // TODO: Implement actual database query with proper filtering and pagination
        // This is a placeholder that returns empty results until real implementation
        let _ = params; // Suppress unused parameter warning
        Ok(vec![])
    }

    /// Count users for admin panel
    pub fn count_users_admin(&self, params: &GetUsersQuery) -> Result<i64> {
        // TODO: Implement actual user count query
        let _ = params; // Suppress unused parameter warning
        Ok(0)
    }

    /// Update user status (admin function)
    pub fn update_user_status(
        &self,
        user_id: Uuid,
        status: &str,
        admin_id: Uuid,
        reason: Option<&str>,
    ) -> Result<()> {
        let _conn = self.get_connection()?;

        // In a real implementation, you'd have a status column in users table
        // For now, we'll just log this operation
        tracing::info!(
            "Admin {} updated user {} status to {}: {:?}",
            admin_id,
            user_id,
            status,
            reason
        );

        // This would be the actual update:
        // diesel::update(users::table.filter(users::id.eq(user_id)))
        //     .set((
        //         users::status.eq(status),
        //         users::updated_at.eq(Utc::now()),
        //         // Add other status-related fields
        //     ))
        //     .execute(&mut conn)?;

        Ok(())
    }

    /// Admin reset user password
    pub fn admin_reset_user_password(&self, user_id: Uuid, password_hash: &str) -> Result<()> {
        let mut conn = self.get_connection()?;

        diesel::update(
            auth_users::table
                .filter(auth_users::user_id.eq(user_id))
                .filter(auth_users::deleted_at.is_null()),
        )
        .set((
            auth_users::password_hash.eq(password_hash),
            // In a real implementation, you might have a password_reset_required field:
            // auth_users::password_reset_required.eq(true),
        ))
        .execute(&mut conn)?;

        Ok(())
    }

    /// Revoke all user sessions (admin function)
    pub fn revoke_all_user_sessions(&self, user_id: Uuid, reason: &str) -> Result<u32> {
        // This would require a user_sessions table, which we haven't implemented yet
        // For now, return a mock count
        tracing::info!(
            "Revoking all sessions for user {} with reason: {}",
            user_id,
            reason
        );
        Ok(0)
    }

    /// Log security event
    pub fn log_security_event(
        &self,
        user_id: Option<Uuid>,
        event_type: &str,
        _metadata: Option<serde_json::Value>,
        success: bool,
        ip_address: Option<&str>,
    ) -> Result<()> {
        // This would require a security_events table
        tracing::info!(
            "Security event: user_id={:?}, event_type={}, success={}, ip={:?}",
            user_id,
            event_type,
            success,
            ip_address
        );
        Ok(())
    }

    /// Get security logs for admin panel
    pub fn get_security_logs(
        &self,
        params: &SecurityLogsQuery,
        offset: u32,
    ) -> Result<Vec<SecurityLogEntry>> {
        // TODO: Implement actual security logs query from security_events table
        let _ = (params, offset); // Suppress unused parameter warnings
        Ok(vec![])
    }

    /// Count security logs
    pub fn count_security_logs(&self, params: &SecurityLogsQuery) -> Result<i64> {
        // TODO: Implement actual security logs count query
        let _ = params; // Suppress unused parameter warning
        Ok(0)
    }

    // ========================================
    // Auth User Soft Delete Operations
    // ========================================

    /// Soft delete auth user by user_id (admin function)
    pub fn soft_delete_auth_user(&self, user_id: Uuid) -> Result<()> {
        let mut conn = self.get_connection()?;

        diesel::update(
            auth_users::table
                .filter(auth_users::user_id.eq(user_id))
                .filter(auth_users::deleted_at.is_null()),
        )
        .filter(auth_users::deleted_at.is_null())
        .set(auth_users::deleted_at.eq(Some(Utc::now())))
        .execute(&mut conn)?;

        Ok(())
    }

    /// Soft delete auth user by email (admin function)
    pub fn soft_delete_auth_user_by_email(&self, email: &str) -> Result<()> {
        let mut conn = self.get_connection()?;

        diesel::update(
            auth_users::table
                .filter(auth_users::email.eq(email))
                .filter(auth_users::deleted_at.is_null()),
        )
        .filter(auth_users::deleted_at.is_null())
        .set(auth_users::deleted_at.eq(Some(Utc::now())))
        .execute(&mut conn)?;

        Ok(())
    }

    /// Restore soft deleted auth user by user_id (admin function)
    pub fn restore_auth_user(&self, user_id: Uuid) -> Result<()> {
        let mut conn = self.get_connection()?;

        diesel::update(
            auth_users::table
                .filter(auth_users::user_id.eq(user_id))
                .filter(auth_users::deleted_at.is_null()),
        )
        .filter(auth_users::deleted_at.is_not_null())
        .set(auth_users::deleted_at.eq(None::<DateTime<Utc>>))
        .execute(&mut conn)?;

        Ok(())
    }

    /// Restore soft deleted auth user by email (admin function)
    pub fn restore_auth_user_by_email(&self, email: &str) -> Result<()> {
        let mut conn = self.get_connection()?;

        diesel::update(
            auth_users::table
                .filter(auth_users::email.eq(email))
                .filter(auth_users::deleted_at.is_null()),
        )
        .filter(auth_users::deleted_at.is_not_null())
        .set(auth_users::deleted_at.eq(None::<DateTime<Utc>>))
        .execute(&mut conn)?;

        Ok(())
    }

    /// Check if auth user is soft deleted
    pub fn is_auth_user_deleted(&self, user_id: Uuid) -> Result<bool> {
        let mut conn = self.get_connection()?;

        let deleted_at: Option<DateTime<Utc>> = auth_users::table
            .filter(auth_users::user_id.eq(user_id))
            .select(auth_users::deleted_at)
            .first(&mut conn)
            .optional()?
            .flatten();

        Ok(deleted_at.is_some())
    }

    // ========================================
    // User Soft Delete Operations
    // ========================================

    /// Soft delete user by user_id (admin function)
    pub fn soft_delete_user(&self, user_id: Uuid) -> Result<()> {
        let mut conn = self.get_connection()?;

        diesel::update(users::table.filter(users::id.eq(user_id)))
            .filter(users::deleted_at.is_null())
            .set(users::deleted_at.eq(Some(Utc::now())))
            .execute(&mut conn)?;

        Ok(())
    }

    /// Soft delete user by email (admin function)
    pub fn soft_delete_user_by_email(&self, email: &str) -> Result<()> {
        let mut conn = self.get_connection()?;

        diesel::update(users::table.filter(users::email.eq(email)))
            .filter(users::deleted_at.is_null())
            .set(users::deleted_at.eq(Some(Utc::now())))
            .execute(&mut conn)?;

        Ok(())
    }

    /// Restore soft deleted user by user_id (admin function)
    pub fn restore_user(&self, user_id: Uuid) -> Result<()> {
        let mut conn = self.get_connection()?;

        diesel::update(users::table.filter(users::id.eq(user_id)))
            .filter(users::deleted_at.is_not_null())
            .set(users::deleted_at.eq(None::<DateTime<Utc>>))
            .execute(&mut conn)?;

        Ok(())
    }

    /// Restore soft deleted user by email (admin function)
    pub fn restore_user_by_email(&self, email: &str) -> Result<()> {
        let mut conn = self.get_connection()?;

        diesel::update(users::table.filter(users::email.eq(email)))
            .filter(users::deleted_at.is_not_null())
            .set(users::deleted_at.eq(None::<DateTime<Utc>>))
            .execute(&mut conn)?;

        Ok(())
    }

    /// Check if user is soft deleted
    pub fn is_user_deleted(&self, user_id: Uuid) -> Result<bool> {
        let mut conn = self.get_connection()?;

        let deleted_at: Option<DateTime<Utc>> = users::table
            .filter(users::id.eq(user_id))
            .select(users::deleted_at)
            .first(&mut conn)
            .optional()?
            .flatten();

        Ok(deleted_at.is_some())
    }
}
