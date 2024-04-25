package server

import (
	"fmt"

	"github.com/labstack/echo/v4"
)

func (s *Server) setRoutes(devMode bool) {
	// SECTION - Public Routes
	// ANCHOR - Internal (ONLY GET REQUESTS)
	s.router.GET("api/internal/owner-registered", func(c echo.Context) error {
		return c.JSON(200, s.internal.ownerRegistered)
	})
	// ANCHOR - Index
	s.router.GET("/ping", func(c echo.Context) error {
		return c.JSON(200, "pong")
	})
	// ANCHOR - Analytics
	s.router.POST("/api/analytics", s.postAnalytics)

	// SECTION - Guest Routes
	// ANCHOR - Auth
	routeAuthGuest := s.router.Group("/api", s.guestMiddleware)
	routeAuthGuest.POST("/login", s.postLoginRoute)
	routeAuthGuest.POST("/register", s.postRegisterRoute)
	routeAuthGuest.POST("/confirm-email", s.postConfirmEmailRoute)
	routeAuthGuest.POST("/forgot-password", s.postForgotPasswordRoute)
	routeAuthGuest.POST("/recover-account", s.postRecoverAccountRoute)

	// SECTION - Private Routes
	// ANCHOR - Index & Web Socket
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
	// ANCHOR - Config
	routeConfigPrivate := s.router.Group("/api/config", s.jwtMiddleware)
	routeConfigPrivate.GET("/realtime", s.getRealtimeConfig)
	routeConfigPrivate.POST("/realtime/machines-tracking", s.postRealtimeConfigMachinesTracking)
	// ANCHOR - Machines
	routeMachinesPrivate := s.router.Group("/api/machines", s.jwtMiddleware)
	routeMachinesPrivate.GET("", s.getMachines)
	routeMachinesPrivate.POST("", s.postMachines)
	routeMachinesPrivate.DELETE("/:id", s.deleteMachines)
	// ANCHOR - Apps
	routeAppsPrivate := s.router.Group("/api/apps", s.jwtMiddleware)
	routeAppsPrivate.GET("", s.getApps)
	routeAppsPrivate.POST("", s.postApps)
	routeAppsPrivate.DELETE("/:id", s.deleteApps)
	// ANCHOR - Log
	// NOTE: auth by x-api-key header, not jwt
	routeLogPrivate := s.router.Group("/api/log")
	routeLogPrivate.POST("/machine", s.postLogMachine)
	routeLogPrivate.POST("/app", s.postLogApp)

	// SECTION - Moderation Routes
}
