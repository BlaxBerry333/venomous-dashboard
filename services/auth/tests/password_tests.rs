use venomous_dashboard_auth::utils::PasswordService;

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
