package server

import (
	"net/http"
	"time"

	"github.com/UPSxACE/my-logger/api/db"
	"github.com/labstack/echo/v4"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type ApiKeysDto struct {
	Id        string             `json:"id" bson:"_id"`
	Name      string             `json:"name" bson:"name"`
	Value     string             `json:"value" bson:"value"`
	CreatedAt primitive.DateTime `json:"created_at" bson:"created_at"`
	Machine   []db.Machine       `json:"machine" bson:"machine"`
}

func (s *Server) getApiKeys(c echo.Context) error {
	ctx := c.Request().Context()

	apiKeys := []ApiKeysDto{}

	firstStage := bson.M{"$match": bson.M{"deleted": false}}
	secondStage := bson.M{"$lookup": bson.M{
		"from":         "machines",
		"localField":   "machine_id",
		"foreignField": "_id",
		"as":           "machine",
	}}
	thirdStage := bson.M{"$sort": bson.M{
		"created_at": -1,
	}}

	cursor, err := s.Collections.ApiKeys.Aggregate(ctx, bson.A{firstStage, secondStage, thirdStage})
	if err != nil {
		c.Logger().Error(err)
		return echo.ErrInternalServerError
	}

	err = cursor.All(ctx, &apiKeys)
	if err != nil {
		c.Logger().Error(err)
		return echo.ErrInternalServerError
	}

	return c.JSON(http.StatusOK, apiKeys)
}

type PostApiKeysBody struct {
	Name      string `json:"name"`
	MachineId string `json:"machine_id"`
}

func (s *Server) postApiKeys(c echo.Context) error {
	// Read body
	body := &PostAppsBody{}

	if err := c.Bind(body); err != nil {
		return echo.ErrBadRequest
	}

	// Validate fields
	if body.Name == "" || body.MachineId == "" {
		return echo.ErrBadRequest
	}

	machineId, err := primitive.ObjectIDFromHex(body.MachineId)
	if err != nil {
		return echo.ErrBadRequest
	}

	ctx := c.Request().Context()

	// FIND MACHINE AND IF NOT RETURN ERR
	result := s.Collections.Machines.FindOne(ctx, bson.M{"_id": machineId, "deleted": false}, nil)
	machine := &db.Machine{}
	err = result.Decode(machine)
	if err != nil {
		return echo.ErrBadRequest
	}

	// Create and save a new api key
	newApiKeyGenerated, err := generateAPIKey(32)
	if err != nil {
		c.Logger().Error(err)
		return echo.ErrInternalServerError
	}

	newApiKey := &db.ApiKey{
		ID:        primitive.NewObjectID(),
		Name:      body.Name,
		MachineId: machineId,
		Value:     newApiKeyGenerated,
		CreatedAt: primitive.NewDateTimeFromTime(time.Now()),
		Deleted:   false,
	}

	_, err = s.Collections.ApiKeys.InsertOne(ctx, newApiKey, nil)
	if err != nil {
		c.Logger().Error(err)
		return echo.ErrInternalServerError
	}

	return c.JSON(http.StatusOK, newApiKeyGenerated)
}
