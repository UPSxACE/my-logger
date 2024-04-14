package server

import (
	"context"
	"fmt"
	"os"

	"github.com/UPSxACE/my-logger/api/db"
	"github.com/go-playground/validator/v10"
	echojwt "github.com/labstack/echo-jwt/v4"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Server struct {
	router         *echo.Echo
	tokenBlacklist sessionRevokeList
	jwtConfig      echojwt.Config
	Collections    db.Collections
	validator      *validator.Validate // use a single instance of Validate, it caches struct info
}

func NewServer(devMode bool) *Server {
	e := echo.New()

	// Essential Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins:     []string{os.Getenv("CORS_ORIGIN")},
		AllowHeaders:     []string{"Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"},
		AllowCredentials: true,
	}))

	server := &Server{router: e}

	server.setupValidator()
	server.setupDatabase(devMode)
	server.setupJwt()
	server.setRoutes(devMode)

	return server
}

func (s *Server) Start(address string) error {
	count, _ := s.Collections.Users.CountDocuments(context.TODO(), map[string]string{}, &options.CountOptions{})
	fmt.Println(count)
	return s.router.Start(address)
}
