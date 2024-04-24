package server

import (
	"fmt"
	"strconv"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

var Logger = middleware.RequestLoggerConfig{
	LogRequestID:     true,
	LogLatency:       true,
	LogRemoteIP:      true,
	LogHost:          true,
	LogMethod:        true,
	LogURI:           true,
	LogUserAgent:     true,
	LogStatus:        true,
	LogError:         true,
	LogResponseSize:  true,
	LogContentLength: true,
	LogRoutePath:     true,
	LogReferer:       true,
	LogHeaders:       []string{"Cookie", "X-Api-Key"},
	LogProtocol:      true,
	LogURIPath:       true,
	// BeforeNextFunc: func(c echo.Context) {
	// 	fmt.Println("BEFORE")
	// },
	LogValuesFunc: func(c echo.Context, v middleware.RequestLoggerValues) error {
		time_ms := time.Since(v.StartTime).Milliseconds()
		time_ms_str := strconv.Itoa(int(time_ms))

		// log := echo.Map{
		// 	"request_id":     v.RequestID,
		// 	"protocol":       v.Protocol,
		// 	"time_ms":        time_ms,
		// 	"latency":        v.Latency,
		// 	"remote_ip":      v.RemoteIP,
		// 	"host":           v.Host,
		// 	"method":         v.Method,
		// 	"uri":            v.URI,
		// 	"uri_path":       v.URIPath,
		// 	"user_agent":     v.UserAgent,
		// 	"status":         v.Status,
		// 	"error":          v.Error,
		// 	"response_size":  v.ResponseSize,
		// 	"content_length": v.ContentLength,
		// 	"route_path":     v.RoutePath,
		// 	"referer":        v.Referer,
		// 	"x-api-key":      v.Headers["X-Api-Key"],
		// 	"cookies":        v.Headers["Cookie"],
		// }

		fmt.Printf("Request: %-7s | %-20s | STATUS: %-3d | %-8s | ERROR: %v\n", v.Method, v.URIPath, v.Status, time_ms_str+"ms", v.Error)
		return nil
	},
}
