use chrono::{DateTime, Utc};
use diesel::prelude::*;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::schema::{auth_users, roles, users};

/// Role model for database
#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Identifiable, Selectable)]
#[diesel(table_name = roles)]
pub struct Role {
    pub id: Uuid,
    pub name: String,
    pub description: Option<String>,
    pub created_at: DateTime<Utc>,
}

/// Role insert model
#[derive(Debug, Insertable)]
#[diesel(table_name = roles)]
pub struct NewRole {
    pub name: String,
    pub description: Option<String>,
}

/// User model for database
#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Identifiable, Selectable)]
#[diesel(table_name = users)]
pub struct User {
    pub id: Uuid,
    pub email: String,
    pub name: String,
    pub role_id: Uuid,
    pub avatar: Option<String>,
    pub locale: String,
    pub timezone: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// User insert model
#[derive(Debug, Insertable)]
#[diesel(table_name = users)]
pub struct NewUser {
    pub email: String,
    pub name: String,
    pub role_id: Uuid,
    pub avatar: Option<String>,
    pub locale: String,
    pub timezone: Option<String>,
}

/// Auth user model for authentication data
#[derive(
    Debug, Clone, Serialize, Deserialize, Queryable, Identifiable, Selectable, Associations,
)]
#[diesel(table_name = auth_users)]
#[diesel(belongs_to(User))]
pub struct AuthUser {
    pub id: Uuid,
    pub user_id: Uuid, // References main user table
    pub email: String,
    pub password_hash: String,
    pub email_verified: bool,
    pub last_login: Option<DateTime<Utc>>,
    pub failed_login_attempts: i32,
    pub account_locked_until: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Auth user insert model
#[derive(Debug, Insertable)]
#[diesel(table_name = auth_users)]
pub struct NewAuthUser {
    pub user_id: Uuid,
    pub email: String,
    pub password_hash: String,
    pub email_verified: bool,
}
