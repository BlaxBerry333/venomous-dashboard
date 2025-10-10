package proxy

import (
	"fmt"
	"net/http/httputil"
	"net/url"

	"github.com/gin-gonic/gin"
)

// AuthProxy handles reverse proxy operations for auth service
type AuthProxy struct {
	authServiceURL string
}

// NewAuthProxy creates a new auth proxy instance
func NewAuthProxy(authServiceURL string) *AuthProxy {
	return &AuthProxy{
		authServiceURL: authServiceURL,
	}
}

// CreateHandler creates a reverse proxy handler for specified path
func (p *AuthProxy) CreateHandler(targetPath string) gin.HandlerFunc {
	return func(c *gin.Context) {
		targetURL, err := url.Parse(p.authServiceURL)
		if err != nil {
			c.JSON(500, gin.H{"error": "Invalid target URL"})
			return
		}

		proxy := httputil.NewSingleHostReverseProxy(targetURL)

		// Modify request to point to target service
		c.Request.URL.Scheme = targetURL.Scheme
		c.Request.URL.Host = targetURL.Host
		c.Request.Host = targetURL.Host
		c.Request.URL.Path = targetPath

		fmt.Printf("Proxying auth request to: %s%s\n", targetURL, targetPath)
		proxy.ServeHTTP(c.Writer, c.Request)
	}
}
