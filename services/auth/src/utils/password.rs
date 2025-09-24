use bcrypt::{hash, verify, DEFAULT_COST};
use std::env;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum PasswordError {
    #[error("Failed to hash password: {0}")]
    HashError(#[from] bcrypt::BcryptError),
    #[error("Invalid password")]
    InvalidPassword,
    #[error("Password verification failed")]
    VerificationFailed,
}

pub struct PasswordService;

impl PasswordService {
    /// Get bcrypt cost from environment (default: 10)
    fn get_cost() -> u32 {
        env::var("BCRYPT_COST")
            .unwrap_or_else(|_| DEFAULT_COST.to_string())
            .parse()
            .unwrap_or(DEFAULT_COST)
    }

    /// Hash a password using bcrypt
    pub fn hash_password(password: &str) -> Result<String, PasswordError> {
        if password.is_empty() {
            return Err(PasswordError::InvalidPassword);
        }

        let cost = Self::get_cost();
        let hashed = hash(password, cost)?;
        Ok(hashed)
    }

    /// Verify a password against its hash
    pub fn verify_password(password: &str, hash: &str) -> Result<bool, PasswordError> {
        if password.is_empty() || hash.is_empty() {
            return Err(PasswordError::InvalidPassword);
        }

        let is_valid = verify(password, hash)?;
        Ok(is_valid)
    }

    /// Validate password strength
    pub fn validate_password_strength(password: &str) -> Result<(), PasswordError> {
        if password.len() < 8 {
            return Err(PasswordError::InvalidPassword);
        }

        // Check for at least one letter and one number
        let has_letter = password.chars().any(|c| c.is_alphabetic());
        let has_number = password.chars().any(|c| c.is_numeric());

        if !has_letter || !has_number {
            return Err(PasswordError::InvalidPassword);
        }

        Ok(())
    }

    /// Generate a random password (for testing or temporary passwords)
    pub fn generate_random_password(length: usize) -> String {
        use rand::Rng;
        const CHARSET: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZ\
                                abcdefghijklmnopqrstuvwxyz\
                                0123456789\
                                !@#$%^&*";
        let mut rng = rand::thread_rng();

        (0..length)
            .map(|_| {
                let idx = rng.gen_range(0..CHARSET.len());
                CHARSET[idx] as char
            })
            .collect()
    }
}
