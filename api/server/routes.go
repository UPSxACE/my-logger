package server

import (
	"fmt"

	"github.com/labstack/echo/v4"
)

func (s *Server) setRoutes(devMode bool) {
	// SECTION - Public Routes
	s.router.GET("api/internal/owner-registered", func(c echo.Context) error {
		return c.JSON(200, s.internal.ownerRegistered)
	})
	// ANCHOR - Index
	s.router.GET("/ping", func(c echo.Context) error {
		return c.JSON(200, "pong")
	})

	// SECTION - Guest Routes
	routeIndexGuest := s.router.Group("/api", s.guestMiddleware)
	// ANCHOR - Auth
	routeIndexGuest.POST("/login", s.postLoginRoute)
	routeIndexGuest.POST("/register", s.postRegisterRoute)
	routeIndexGuest.POST("/confirm-email", s.postConfirmEmailRoute)
	routeIndexGuest.POST("/forgot-password", s.postForgotPasswordRoute)
	routeIndexGuest.POST("/recover-account", s.postRecoverAccountRoute)

	// SECTION - Private Routes
	routeIndexPrivate := s.router.Group("/api", s.jwtMiddleware)
	routeIndexPrivate.GET("/ws", s.getWs)
	if devMode {
		// Test nextjs session token
		routeIndexPrivate.GET("/test", func(c echo.Context) error {
			cookie, _ := c.Cookie("next-auth.session-token")
			fmt.Printf("%#v\n", cookie.Value)
			return c.JSON(200, "pong")
		})
	}

	// SECTION - Moderation Routes
}
