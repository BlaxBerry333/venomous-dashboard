package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/venomous-dashboard/api-gateway/internal/middleware"
	"github.com/venomous-dashboard/api-gateway/internal/proxy"
	"github.com/venomous-dashboard/api-gateway/internal/router"
)

func main() {
	// Set Gin mode to release
	gin.SetMode(gin.ReleaseMode)

	// Create router instance
	r := gin.New()

	// Add middleware - custom logger that skips /health requests
	r.Use(gin.LoggerWithConfig(gin.LoggerConfig{
		SkipPaths: []string{"/health"},
	}))
	r.Use(middleware.CORS())
	r.Use(gin.Recovery())

	// Initialize proxies
	authServiceURL := "http://auth:8080"
	authProxy := proxy.NewAuthProxy(authServiceURL)

	notesServiceURL := "http://notes:8200"
	notesProxy := proxy.NewNotesProxy(notesServiceURL)

	// Add JWT authentication middleware
	r.Use(middleware.JWTAuth(authServiceURL))

	// Health check endpoint (support both GET and HEAD)
	healthHandler := func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "healthy",
			"service": "api-gateway",
			"version": "1.0.0",
		})
	}
	r.GET("/health", healthHandler)
	r.HEAD("/health", healthHandler)

	// Setup routes - pure proxy mode
	router.SetupAuthRoutes(r, authProxy)
	router.SetupUserRoutes(r, authProxy)
	router.SetupNotesRoutes(r, notesProxy)

	// Start server
	port := ":8080"
	fmt.Printf("Server: venomous-api-gateway starting on port %s\n", port)

	// Start HTTP server
	if err := r.Run(port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
