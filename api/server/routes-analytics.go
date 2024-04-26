package server

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/UPSxACE/my-logger/api/db"
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

func (s *Server) getAnalytics(c echo.Context) error {
	ctx := c.Request().Context()

	analyticsLogs := []db.Analytics{}

	findResult, err := s.Collections.AnalyticsCollection.Find(ctx, echo.Map{})
	if err != nil {
		c.Logger().Error(err)
		return echo.ErrInternalServerError
	}
	err = findResult.All(ctx, &analyticsLogs)
	if err != nil {
		c.Logger().Error(err)
		return echo.ErrInternalServerError
	}

	return c.JSON(http.StatusOK, analyticsLogs)
}
