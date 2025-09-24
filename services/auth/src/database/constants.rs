/// Role constants for the authentication system
pub struct Roles;

impl Roles {
    /// Regular user with basic access
    pub const USER: &'static str = "user";

    /// Administrator with full access
    pub const ADMIN: &'static str = "admin";

    /// Super administrator with all permissions
    pub const SUPER_ADMIN: &'static str = "super_admin";
}

/// Account locking constants
pub struct AccountLock;

impl AccountLock {
    /// Maximum number of failed login attempts before account is locked
    pub const MAX_FAILED_ATTEMPTS: i32 = 5;

    /// Auto-unlock time in minutes
    pub const AUTO_UNLOCK_MINUTES: i64 = 30;
}
