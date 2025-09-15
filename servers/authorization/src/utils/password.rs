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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_password_hashing_and_verification() {
        let password = "test_password123";

        // Hash password
        let hash = PasswordService::hash_password(password).unwrap();
        assert!(!hash.is_empty());
        assert_ne!(hash, password);

        // Verify correct password
        assert!(PasswordService::verify_password(password, &hash).unwrap());

        // Verify incorrect password
        assert!(!PasswordService::verify_password("wrong_password", &hash).unwrap());
    }

    #[test]
    fn test_password_strength_validation() {
        // Valid passwords
        assert!(PasswordService::validate_password_strength("password123").is_ok());
        assert!(PasswordService::validate_password_strength("MySecure1Pass").is_ok());

        // Invalid passwords
        assert!(PasswordService::validate_password_strength("short").is_err()); // Too short
        assert!(PasswordService::validate_password_strength("onlyletters").is_err()); // No numbers
        assert!(PasswordService::validate_password_strength("12345678").is_err()); // No letters
        assert!(PasswordService::validate_password_strength("").is_err()); // Empty
    }

    #[test]
    fn test_random_password_generation() {
        let password = PasswordService::generate_random_password(12);
        assert_eq!(password.len(), 12);

        // Different calls should generate different passwords
        let password2 = PasswordService::generate_random_password(12);
        assert_ne!(password, password2);
    }

    #[test]
    fn test_empty_password_handling() {
        assert!(PasswordService::hash_password("").is_err());
        assert!(PasswordService::verify_password("", "hash").is_err());
        assert!(PasswordService::verify_password("password", "").is_err());
    }
}