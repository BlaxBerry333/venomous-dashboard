use std::env;
use uuid::Uuid;
use venomous_dashboard_auth::utils::JwtService;
use venomous_dashboard_auth::Roles;

#[test]
fn test_jwt_generation_and_validation() {
    env::set_var("JWT_SECRET", "test-secret-key");
    env::set_var("JWT_EXPIRATION_HOURS", "1");

    let user_id = Uuid::new_v4();
    let email = "test@example.com";
    let role = Roles::USER;

    // Generate token
    let token = JwtService::generate_token(user_id, email, role).unwrap();
    assert!(!token.is_empty());

    // Validate token
    let token_data = JwtService::validate_token(&token).unwrap();
    assert_eq!(token_data.claims.sub, user_id.to_string());
    assert_eq!(token_data.claims.email, email);
    assert_eq!(token_data.claims.role, role);

    // Extract data
    assert_eq!(JwtService::extract_user_id(&token).unwrap(), user_id);
    assert_eq!(JwtService::extract_email(&token).unwrap(), email);
    assert_eq!(JwtService::extract_role(&token).unwrap(), role);

    // Check expiration
    assert!(!JwtService::is_token_expired(&token));
}

#[test]
fn test_invalid_token() {
    env::set_var("JWT_SECRET", "test-secret-key");

    let result = JwtService::validate_token("invalid-token");
    assert!(result.is_err());
}
