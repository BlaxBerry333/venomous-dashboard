package router

import (
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/venomous-dashboard/api-gateway/internal/proxy"
)

// pathRewriteMiddleware rewrites the request path by removing the prefix
func pathRewriteMiddleware(prefix string) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Request.URL.Path = strings.TrimPrefix(c.Request.URL.Path, prefix)
		c.Next()
	}
}

// SetupNotesRoutes configures notes-related routes
// All routes are proxied to the notes service
func SetupNotesRoutes(r *gin.Engine, notesProxy *proxy.NotesProxy) {
	// Create a group for all notes routes with path rewrite middleware
	notes := r.Group("/api/notes")
	notes.Use(pathRewriteMiddleware("/api/notes"))

	// Memos routes (no additional prefix needed as path is already rewritten)
	notes.GET("/memos", notesProxy.CreateHandler())
	notes.POST("/memos", notesProxy.CreateHandler())
	notes.GET("/memos/:id", notesProxy.CreateHandler())
	notes.PUT("/memos/:id", notesProxy.CreateHandler())
	notes.DELETE("/memos/:id", notesProxy.CreateHandler())

	// Articles routes
	notes.GET("/articles", notesProxy.CreateHandler())
	notes.POST("/articles", notesProxy.CreateHandler())
	notes.GET("/articles/:id", notesProxy.CreateHandler())
	notes.PUT("/articles/:id", notesProxy.CreateHandler())
	notes.DELETE("/articles/:id", notesProxy.CreateHandler())

	// Chapter routes (must come after to avoid conflicts)
	notes.GET("/articles/:id/chapters/:chapterId", notesProxy.CreateHandler())
	notes.POST("/articles/:id/chapters", notesProxy.CreateHandler())
	notes.PUT("/articles/:id/chapters/:chapterId", notesProxy.CreateHandler())
	notes.DELETE("/articles/:id/chapters/:chapterId", notesProxy.CreateHandler())
}
