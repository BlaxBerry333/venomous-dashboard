package router

import (
	"github.com/gin-gonic/gin"
	"github.com/venomous-dashboard/api-gateway/internal/proxy"
)

// SetupUserRoutes configures user management routes
// All routes are proxied to the auth service
func SetupUserRoutes(r *gin.Engine, authProxy *proxy.AuthProxy) {
	// User route group - proxy to auth service for user management
	user := r.Group("/api/user")
	{
		// Core user profile routes
		user.GET("/profile", authProxy.CreateHandler("/user/profile"))
		user.PATCH("/profile", authProxy.CreateHandler("/user/profile"))
	}
}
