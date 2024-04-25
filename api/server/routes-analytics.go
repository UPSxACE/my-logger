package server

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/labstack/echo/v4"
)

func (s *Server) postAnalytics(c echo.Context) error {
	body := make(map[string]interface{})

	err := json.NewDecoder(c.Request().Body).Decode(&body)
	if err != nil {
		return c.NoContent(http.StatusOK)
	}

	if body["_host"] != nil && body["_path"] != nil {
		go func() {
			// save analytics log asynchronously
			_, err := s.Collections.AnalyticsCollection.InsertOne(context.Background(), body)
			if err == nil {
				s.realTimeStatsSubject.ProcessAnalyticsLog(body)
			}
		}()
	}

	return c.NoContent(http.StatusOK)
}
