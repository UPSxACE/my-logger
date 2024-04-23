package server

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func (s *Server) getRealtimeConfig(c echo.Context) error {
	return c.JSON(http.StatusOK, s.realTimeStatsSubject.Config)
}

func (s *Server) postRealtimeConfigMachinesTracking(c echo.Context) error {
	var machineIds []machineId

	err := c.Bind(&machineIds)
	if err != nil {
		return echo.ErrBadRequest
	}

	ctx := c.Request().Context()

	// Validate all the ids (check if they exist)
	for _, machineId := range machineIds {
		oid, err := primitive.ObjectIDFromHex(machineId)
		if err != nil {
			return echo.ErrBadRequest
		}

		res := s.Collections.Machines.FindOne(ctx, bson.M{
			"_id":     oid,
			"deleted": false,
		})
		if res.Err() != nil {
			return echo.ErrBadRequest
		}
	}

	config := s.realTimeStatsSubject.Config
	config.RealtimeUsageMachinesToTrack = machineIds

	err = s.SaveRealtimeConfig(config)
	if err != nil {
		return echo.ErrInternalServerError
	}

	return c.NoContent(http.StatusOK)
}
