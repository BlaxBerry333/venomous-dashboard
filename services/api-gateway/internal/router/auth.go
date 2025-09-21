package router

import (
	"github.com/gin-gonic/gin"
	"github.com/venomous-dashboard/api-gateway/internal/proxy"
)

// SetupAuthRoutes configures authentication-related routes
// All routes are proxied to the auth service
func SetupAuthRoutes(r *gin.Engine, authProxy *proxy.AuthProxy) {
	// Auth route group - pure proxy mode
	auth := r.Group("/api/auth")
	{
		// User authentication routes
		auth.POST("/signup", authProxy.CreateHandler("/signup"))
		auth.POST("/signin", authProxy.CreateHandler("/signin"))
		auth.POST("/logout", authProxy.CreateHandler("/logout"))

		// Token management routes
		auth.POST("/token-verify", authProxy.CreateHandler("/token-verify"))
		auth.POST("/token-info", authProxy.CreateHandler("/token-info"))
		auth.POST("/token-refresh", authProxy.CreateHandler("/token-refresh"))
	}
}
