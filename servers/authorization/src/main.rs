use axum::{routing::{get, post, put, delete}, Router};
use std::net::SocketAddr;
use std::sync::Arc;
use tower_http::trace::TraceLayer;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

// Import handlers and database
use venomous_dashboard_authorization::{
    database::Database,
    handlers::{
        auth::{logout_handler, signin_handler, signup_handler},
        token::{token_info_handler, token_refresh_handler, token_verify_handler},
        admin::{
            get_users_handler,
            update_user_status_handler,
            reset_user_password_handler,
            get_security_logs_handler,
            revoke_user_sessions_handler
        },
    },
};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Load environment variables
    dotenvy::dotenv().ok();

    // Initialize tracing (stdout)
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            "venomous_dashboard_authorization=info,axum=debug,tower_http=debug",
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    // Initialize database connection pool
    tracing::info!("Initializing database connection pool...");
    let database = match Database::new() {
        Ok(db) => Arc::new(db),
        Err(e) => {
            tracing::error!("Failed to initialize database: {}", e);
            return Err(e.into());
        }
    };

    // Build application router with all handlers and shared state
    let app = Router::new()
        // Authentication routes
        .route("/signup", post(signup_handler))
        .route("/signin", post(signin_handler))
        .route("/logout", post(logout_handler))
        // Token management routes
        .route("/token-verify", post(token_verify_handler))
        .route("/token-info", post(token_info_handler))
        .route("/token-refresh", post(token_refresh_handler))
        // Admin routes (require admin authentication)
        .route("/admin/users", get(get_users_handler))
        .route("/admin/users/:user_id/status", put(update_user_status_handler))
        .route("/admin/users/:user_id/reset-password", post(reset_user_password_handler))
        .route("/admin/security-logs", get(get_security_logs_handler))
        .route("/admin/sessions/revoke", post(revoke_user_sessions_handler))
        // Add shared state (database connection pool)
        .with_state(database)
        // Add logging middleware
        .layer(TraceLayer::new_for_http());

    // Start server
    let addr = SocketAddr::from(([0, 0, 0, 0], 8080));
    tracing::info!(
        "🚀 Venomous Dashboard Authorization service listening on {}",
        addr
    );

    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}