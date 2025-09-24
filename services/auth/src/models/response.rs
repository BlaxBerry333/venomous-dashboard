use serde_json::{json, Value};

/// Standard API response structure for success cases
pub struct ApiResponse;

impl ApiResponse {
    /// Create a success response with data
    pub fn success(data: Value) -> Value {
        json!({
            "success": true,
            "data": data
        })
    }

    /// Create an error response with code and message
    pub fn error(code: &str, message: &str) -> Value {
        json!({
            "success": false,
            "error": {
                "code": code,
                "message": message
            }
        })
    }
}
