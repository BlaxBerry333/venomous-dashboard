package proxy

import (
	"fmt"
	"net/http"
	"net/http/httputil"
	"net/url"

	"github.com/gin-gonic/gin"
)

// NotesProxy handles reverse proxy operations for notes service
type NotesProxy struct {
	notesServiceURL string
}

// NewNotesProxy creates a new notes proxy instance
func NewNotesProxy(notesServiceURL string) *NotesProxy {
	return &NotesProxy{
		notesServiceURL: notesServiceURL,
	}
}

// CreateHandler creates a reverse proxy handler
func (p *NotesProxy) CreateHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		targetURL, err := url.Parse(p.notesServiceURL)
		if err != nil {
			c.JSON(500, gin.H{"error": "Invalid target URL"})
			return
		}

		proxy := httputil.NewSingleHostReverseProxy(targetURL)

		// Customize the Director to preserve headers and set correct path
		originalDirector := proxy.Director
		proxy.Director = func(req *http.Request) {
			originalDirector(req)
			req.URL.Scheme = targetURL.Scheme
			req.URL.Host = targetURL.Host
			req.Host = targetURL.Host
			// Use the path that was already rewritten by middleware
			req.URL.Path = c.Request.URL.Path
			req.URL.RawQuery = c.Request.URL.RawQuery

			// Preserve the user headers injected by JWT middleware
			if userID := c.Request.Header.Get("X-User-ID"); userID != "" {
				req.Header.Set("X-User-ID", userID)
			}
			if email := c.Request.Header.Get("X-User-Email"); email != "" {
				req.Header.Set("X-User-Email", email)
			}
			if role := c.Request.Header.Get("X-User-Role"); role != "" {
				req.Header.Set("X-User-Role", role)
			}

			fmt.Printf("Proxying notes request to: %s%s\n", req.URL.Host, req.URL.Path)
		}

		proxy.ServeHTTP(c.Writer, c.Request)
	}
}
