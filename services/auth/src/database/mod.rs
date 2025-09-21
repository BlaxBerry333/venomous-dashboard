use anyhow::Result;
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::r2d2::{self, ConnectionManager, Pool};
use std::env;
use uuid::Uuid;

use crate::handlers::admin::{GetUsersQuery, SecurityLogEntry, SecurityLogsQuery, UserAdminView};
use crate::models::database::{AuthUser, NewAuthUser, NewUser, Role, User};
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

    /// Get default user role ID
    pub fn get_default_role_id(&self) -> Result<Uuid> {
        let mut conn = self.get_connection()?;

        let role_id = roles::table
            .filter(roles::name.eq("user"))
            .select(roles::id)
            .first::<Uuid>(&mut conn)?;

        Ok(role_id)
    }

    /// Create a new user (main user table)
    pub fn create_user(&self, email: &str, name: &str, locale: &str) -> Result<User> {
        let mut conn = self.get_connection()?;

        let default_role_id = self.get_default_role_id()?;

        let new_user = NewUser {
            email: email.to_string(),
            name: name.to_string(),
            role_id: default_role_id,
            avatar: None,
            locale: locale.to_string(),
            timezone: None,
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

    /// Find user by email
    pub fn find_user_by_email(&self, email: &str) -> Result<Option<User>> {
        let mut conn = self.get_connection()?;

        let user = users::table
            .filter(users::email.eq(email))
            .first::<User>(&mut conn)
            .optional()?;

        Ok(user)
    }

    /// Find auth user by email
    pub fn find_auth_user_by_email(&self, email: &str) -> Result<Option<AuthUser>> {
        let mut conn = self.get_connection()?;

        let auth_user = auth_users::table
            .filter(auth_users::email.eq(email))
            .first::<AuthUser>(&mut conn)
            .optional()?;

        Ok(auth_user)
    }

    /// Update user last login
    pub fn update_last_login(&self, user_id: Uuid) -> Result<()> {
        let mut conn = self.get_connection()?;

        diesel::update(auth_users::table.filter(auth_users::user_id.eq(user_id)))
            .set((
                auth_users::last_login.eq(Some(Utc::now())),
                auth_users::updated_at.eq(Utc::now()),
            ))
            .execute(&mut conn)?;

        Ok(())
    }

    /// Check if email exists
    pub fn email_exists(&self, email: &str) -> Result<bool> {
        let mut conn = self.get_connection()?;

        let count = users::table
            .filter(users::email.eq(email))
            .count()
            .get_result::<i64>(&mut conn)?;

        Ok(count > 0)
    }

    /// Get user with role information
    pub fn get_user_with_role(&self, user_id: Uuid) -> Result<Option<(User, Role)>> {
        let mut conn = self.get_connection()?;

        let result = users::table
            .inner_join(roles::table)
            .filter(users::id.eq(user_id))
            .select((User::as_select(), Role::as_select()))
            .first::<(User, Role)>(&mut conn)
            .optional()?;

        Ok(result)
    }

    /// Get user role by user ID
    pub fn get_user_role(&self, user_id: Uuid) -> Result<Option<String>> {
        let mut conn = self.get_connection()?;

        let role_name = users::table
            .inner_join(roles::table)
            .filter(users::id.eq(user_id))
            .select(roles::name)
            .first::<String>(&mut conn)
            .optional()?;

        Ok(role_name)
    }

    /// Get user by ID
    pub fn find_user_by_id(&self, user_id: Uuid) -> Result<Option<User>> {
        let mut conn = self.get_connection()?;

        let user = users::table
            .filter(users::id.eq(user_id))
            .first::<User>(&mut conn)
            .optional()?;

        Ok(user)
    }

    /// Update failed login attempts and set lock time if threshold is reached
    pub fn increment_failed_login_attempts(&self, email: &str) -> Result<()> {
        let mut conn = self.get_connection()?;

        // Get current failed attempts count
        let current_attempts: i32 = auth_users::table
            .filter(auth_users::email.eq(email))
            .select(auth_users::failed_login_attempts)
            .first(&mut conn)
            .unwrap_or(0);

        let new_attempts = current_attempts + 1;
        let now = Utc::now();

        // If this will be the 5th failed attempt, set account_locked_until (lock for 30 minutes)
        let locked_until = if new_attempts >= 5 {
            Some(now + chrono::Duration::minutes(30))
        } else {
            None
        };

        diesel::update(auth_users::table.filter(auth_users::email.eq(email)))
            .set((
                auth_users::failed_login_attempts.eq(new_attempts),
                auth_users::account_locked_until.eq(locked_until),
                auth_users::updated_at.eq(now),
            ))
            .execute(&mut conn)?;

        Ok(())
    }

    /// Reset failed login attempts and clear lock time
    pub fn reset_failed_login_attempts(&self, email: &str) -> Result<()> {
        let mut conn = self.get_connection()?;

        diesel::update(auth_users::table.filter(auth_users::email.eq(email)))
            .set((
                auth_users::failed_login_attempts.eq(0),
                auth_users::account_locked_until.eq(None::<DateTime<Utc>>),
                auth_users::updated_at.eq(Utc::now()),
            ))
            .execute(&mut conn)?;

        Ok(())
    }

    /// Check if account is currently locked (considering automatic unlock time)
    pub fn is_account_locked(&self, email: &str) -> Result<bool> {
        let mut conn = self.get_connection()?;
        let now = Utc::now();

        let auth_user = auth_users::table
            .filter(auth_users::email.eq(email))
            .select((auth_users::failed_login_attempts, auth_users::account_locked_until))
            .first::<(i32, Option<DateTime<Utc>>)>(&mut conn)
            .optional()?;

        match auth_user {
            Some((failed_attempts, locked_until)) => {
                // Check if account has failed attempts >= 5
                if failed_attempts >= 5 {
                    match locked_until {
                        Some(unlock_time) => {
                            if now >= unlock_time {
                                // Lock time has expired, automatically unlock the account
                                self.reset_failed_login_attempts(email)?;
                                Ok(false) // Account is no longer locked
                            } else {
                                Ok(true) // Account is still locked
                            }
                        }
                        None => Ok(true), // Account is locked indefinitely (manual unlock required)
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

        let locked_until: Option<DateTime<Utc>> = auth_users::table
            .filter(auth_users::email.eq(email))
            .select(auth_users::account_locked_until)
            .first(&mut conn)
            .optional()?
            .flatten();

        match locked_until {
            Some(unlock_time) if now < unlock_time => {
                Ok(Some(unlock_time - now))
            }
            _ => Ok(None),
        }
    }

    /// Manually unlock user account (admin function)
    pub fn admin_unlock_user_account(&self, user_id: Uuid) -> Result<()> {
        let mut conn = self.get_connection()?;

        diesel::update(auth_users::table.filter(auth_users::user_id.eq(user_id)))
            .set((
                auth_users::failed_login_attempts.eq(0),
                auth_users::account_locked_until.eq(None::<DateTime<Utc>>),
                auth_users::updated_at.eq(Utc::now()),
            ))
            .execute(&mut conn)?;

        Ok(())
    }

    /// Manually unlock user account by email (admin function)
    pub fn admin_unlock_user_account_by_email(&self, email: &str) -> Result<()> {
        let mut conn = self.get_connection()?;

        diesel::update(auth_users::table.filter(auth_users::email.eq(email)))
            .set((
                auth_users::failed_login_attempts.eq(0),
                auth_users::account_locked_until.eq(None::<DateTime<Utc>>),
                auth_users::updated_at.eq(Utc::now()),
            ))
            .execute(&mut conn)?;

        Ok(())
    }

    /// Get account lock status for admin view
    pub fn get_account_lock_status(&self, user_id: Uuid) -> Result<Option<(i32, Option<DateTime<Utc>>)>> {
        let mut conn = self.get_connection()?;

        let result = auth_users::table
            .filter(auth_users::user_id.eq(user_id))
            .select((auth_users::failed_login_attempts, auth_users::account_locked_until))
            .first::<(i32, Option<DateTime<Utc>>)>(&mut conn)
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

        diesel::update(auth_users::table.filter(auth_users::user_id.eq(user_id)))
            .set((
                auth_users::password_hash.eq(password_hash),
                auth_users::updated_at.eq(Utc::now()),
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
}
