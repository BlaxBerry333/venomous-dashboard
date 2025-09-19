use chrono::{DateTime, Utc};
use diesel::prelude::*;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::schema::{
    auth_users, permissions, role_permissions, roles, user_profiles, user_roles, users,
};

/// User model for database
#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Identifiable, Selectable)]
#[diesel(table_name = users)]
pub struct User {
    pub id: Uuid,
    pub email: String,
    pub name: String,
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
    pub avatar: Option<String>,
    pub locale: String,
    pub timezone: Option<String>,
}

/// User profile model for database
#[derive(
    Debug, Clone, Serialize, Deserialize, Queryable, Identifiable, Selectable, Associations,
)]
#[diesel(table_name = user_profiles)]
#[diesel(belongs_to(User))]
pub struct UserProfile {
    pub id: Uuid,
    pub user_id: Uuid,
    pub bio: Option<String>,
    pub phone: Option<String>,
    pub company: Option<String>,
    pub website: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// User profile insert model
#[derive(Debug, Insertable)]
#[diesel(table_name = user_profiles)]
pub struct NewUserProfile {
    pub user_id: Uuid,
    pub bio: Option<String>,
    pub phone: Option<String>,
    pub company: Option<String>,
    pub website: Option<String>,
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

/// Role model
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

/// Permission model
#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Identifiable, Selectable)]
#[diesel(table_name = permissions)]
pub struct Permission {
    pub id: Uuid,
    pub name: String,
    pub resource: String,
    pub action: String,
    pub created_at: DateTime<Utc>,
}

/// Permission insert model
#[derive(Debug, Insertable)]
#[diesel(table_name = permissions)]
pub struct NewPermission {
    pub name: String,
    pub resource: String,
    pub action: String,
}

/// User role association
#[derive(
    Debug, Clone, Serialize, Deserialize, Queryable, Identifiable, Selectable, Associations,
)]
#[diesel(table_name = user_roles)]
#[diesel(belongs_to(User))]
#[diesel(belongs_to(Role))]
#[diesel(primary_key(user_id, role_id))]
pub struct UserRole {
    pub user_id: Uuid,
    pub role_id: Uuid,
    pub assigned_at: DateTime<Utc>,
}

/// User role insert model
#[derive(Debug, Insertable)]
#[diesel(table_name = user_roles)]
pub struct NewUserRole {
    pub user_id: Uuid,
    pub role_id: Uuid,
}

/// Role permission association
#[derive(
    Debug, Clone, Serialize, Deserialize, Queryable, Identifiable, Selectable, Associations,
)]
#[diesel(table_name = role_permissions)]
#[diesel(belongs_to(Role))]
#[diesel(belongs_to(Permission))]
#[diesel(primary_key(role_id, permission_id))]
pub struct RolePermission {
    pub role_id: Uuid,
    pub permission_id: Uuid,
}
