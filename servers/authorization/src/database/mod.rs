use anyhow::Result;
use chrono::Utc;
use diesel::prelude::*;
use diesel::r2d2::{self, ConnectionManager, Pool};
use std::env;
use uuid::Uuid;

use crate::models::database::{AuthUser, NewAuthUser, NewUser, NewUserRole, User};
use crate::schema::{auth_users, roles, user_roles, users};

pub type DbPool = Pool<ConnectionManager<PgConnection>>;
pub type DbConnection = r2d2::PooledConnection<ConnectionManager<PgConnection>>;

/// Database service for managing connections and operations
pub struct Database {
    pub pool: DbPool,
}

impl Database {
    /// Create new database connection pool
    pub fn new() -> Result<Self> {
        let database_url = env::var("DATABASE_URL").expect("DATABASE_URL environment variable must be set");

        let manager = ConnectionManager::<PgConnection>::new(database_url);
        let pool = Pool::builder().max_size(15).build(manager)?;

        Ok(Database { pool })
    }

    /// Get a connection from the pool
    pub fn get_connection(&self) -> Result<DbConnection> {
        self.pool.get().map_err(|e| anyhow::anyhow!(e))
    }

    /// Create a new user (main user table)
    pub fn create_user(&self, email: &str, name: &str, locale: &str) -> Result<User> {
        let mut conn = self.get_connection()?;

        let new_user = NewUser {
            email: email.to_string(),
            name: name.to_string(),
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

    /// Get user role by user ID
    pub fn get_user_role(&self, user_id: Uuid) -> Result<Option<String>> {
        let mut conn = self.get_connection()?;

        let role_name = user_roles::table
            .inner_join(roles::table)
            .filter(user_roles::user_id.eq(user_id))
            .select(roles::name)
            .first::<String>(&mut conn)
            .optional()?;

        Ok(role_name)
    }

    /// Assign role to user
    pub fn assign_user_role(&self, user_id: Uuid, role_name: &str) -> Result<()> {
        let mut conn = self.get_connection()?;

        // First find the role ID
        let role_id = roles::table
            .filter(roles::name.eq(role_name))
            .select(roles::id)
            .first::<Uuid>(&mut conn)?;

        // Then create the user-role association
        let new_user_role = NewUserRole { user_id, role_id };

        diesel::insert_into(user_roles::table)
            .values(&new_user_role)
            .on_conflict_do_nothing()
            .execute(&mut conn)?;

        Ok(())
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

    /// Update failed login attempts
    pub fn increment_failed_login_attempts(&self, email: &str) -> Result<()> {
        let mut conn = self.get_connection()?;

        diesel::update(auth_users::table.filter(auth_users::email.eq(email)))
            .set((
                auth_users::failed_login_attempts.eq(auth_users::failed_login_attempts + 1),
                auth_users::updated_at.eq(Utc::now()),
            ))
            .execute(&mut conn)?;

        Ok(())
    }

    /// Reset failed login attempts
    pub fn reset_failed_login_attempts(&self, email: &str) -> Result<()> {
        let mut conn = self.get_connection()?;

        diesel::update(auth_users::table.filter(auth_users::email.eq(email)))
            .set((
                auth_users::failed_login_attempts.eq(0),
                auth_users::updated_at.eq(Utc::now()),
            ))
            .execute(&mut conn)?;

        Ok(())
    }
}
