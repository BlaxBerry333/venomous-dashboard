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

	// Add middleware
	r.Use(gin.Logger())
	r.Use(middleware.CORS())
	r.Use(gin.Recovery())

	// Health check endpoint
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "healthy",
			"service": "api-gateway",
			"version": "1.0.0",
		})
	})

	// Initialize proxies
	authServiceURL := "http://authorization:8080"
	authProxy := proxy.NewAuthProxy(authServiceURL)

	// Setup routes - pure proxy mode
	router.SetupAuthRoutes(r, authProxy)

	// Start server
	port := ":8080"
	fmt.Printf("Server: venomous-api-gateway starting on port %s\n", port)

	// Start HTTP server
	if err := r.Run(port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
