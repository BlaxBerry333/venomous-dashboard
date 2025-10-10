package middleware

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	authTypes "github.com/venomous-dashboard/api-gateway/internal/types/proto_generated/auth"
)

// JWTAuth creates a JWT authentication middleware
func JWTAuth(authServiceURL string) gin.HandlerFunc {
	return func(c *gin.Context) {
		path := c.Request.URL.Path

		// ============================================================
		// Public routes whitelist (no authentication required)
		// ============================================================
		publicRoutes := []string{
			"/health",
			"/api/auth/signup",
			"/api/auth/signin",
		}

		for _, route := range publicRoutes {
			if strings.HasPrefix(path, route) {
				c.Next()
				return
			}
		}

		// ============================================================
		// Extract JWT Token from Authorization header
		// ============================================================
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":   "Unauthorized",
				"message": "Missing or invalid authorization header",
			})
			c.Abort()
			return
		}

		token := strings.TrimPrefix(authHeader, "Bearer ")

		// ============================================================
		// Call Auth service to verify token
		// ============================================================
		requestBody, err := json.Marshal(&authTypes.AuthTokenVerifyRequest{Token: token})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Internal Server Error",
				"message": "Failed to prepare auth request",
			})
			c.Abort()
			return
		}

		resp, err := http.Post(
			authServiceURL+"/token-verify",
			"application/json",
			bytes.NewBuffer(requestBody),
		)

		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":   "Unauthorized",
				"message": "Token verification failed",
			})
			c.Abort()
			return
		}
		defer resp.Body.Close()

		// ============================================================
		// Parse auth service response
		// ============================================================
		body, err := io.ReadAll(resp.Body)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Internal Server Error",
				"message": "Failed to read auth response",
			})
			c.Abort()
			return
		}

		var verifyResp authTypes.AuthTokenVerifyResponse
		if err := json.Unmarshal(body, &verifyResp); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Internal Server Error",
				"message": "Failed to parse auth response",
			})
			c.Abort()
			return
		}

		// Check if verification was successful
		if !verifyResp.Success || resp.StatusCode != http.StatusOK {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":   "Unauthorized",
				"message": "Invalid or expired token",
			})
			c.Abort()
			return
		}

		// ============================================================
		// Extract user information from response
		// ============================================================
		data := verifyResp.Data
		if data == nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Internal Server Error",
				"message": "Invalid user data from auth service",
			})
			c.Abort()
			return
		}

		userID := data.UserId
		email := data.Email
		role := data.Role

		if userID == "" {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Internal Server Error",
				"message": "Invalid user data from auth service",
			})
			c.Abort()
			return
		}

		// ============================================================
		// Inject user information into headers for downstream services
		// ============================================================
		c.Request.Header.Set("X-User-ID", userID)
		c.Request.Header.Set("X-User-Email", email)
		c.Request.Header.Set("X-User-Role", role)

		c.Next()
	}
}
