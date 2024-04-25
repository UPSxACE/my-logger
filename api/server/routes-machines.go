package server

import (
	"net/http"

	"github.com/UPSxACE/my-logger/api/db"
	"github.com/labstack/echo/v4"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type MachineDto struct {
	Id      string `json:"id" bson:"_id"`
	Name    string `json:"name" bson:"name"`
	HostURL string `json:"host_url" bson:"host_url"`
}

func (s *Server) getMachines(c echo.Context) error {
	ctx := c.Request().Context()

	machines := []MachineDto{}

	findResult, err := s.Collections.Machines.Find(ctx, echo.Map{"deleted": false})
	if err != nil {
		c.Logger().Error(err)
		return echo.ErrInternalServerError
	}
	err = findResult.All(ctx, &machines)
	if err != nil {
		c.Logger().Error(err)
		return echo.ErrInternalServerError
	}

	// // find and populate data
	// firstStage := bson.M{"$match": bson.M{"deleted": false}}
	// secondStage := bson.M{"$lookup": bson.M{
	// 	"from":         "api-keys",
	// 	"localField":   "current_api_key_id",
	// 	"foreignField": "_id",
	// 	"as":           "api_key",
	// }}

	// cursor, err := s.Collections.Machines.Aggregate(ctx, bson.A{firstStage, secondStage})
	// if err != nil {
	// 	c.Logger().Error(err)
	// 	return echo.ErrInternalServerError
	// }

	// for cursor.Next(ctx) {
	// 	var result MachineDto
	// 	if err := cursor.Decode(&result); err != nil {
	// 		c.Logger().Error(err)
	// 		return echo.ErrInternalServerError
	// 	}
	// 	machines = append(machines, result)
	// }

	// if err := cursor.Err(); err != nil {
	// 	c.Logger().Error(err)
	// 	return echo.ErrInternalServerError
	// }

	return c.JSON(http.StatusOK, machines)
}

type PostMachinesBody struct {
	Name    string `json:"name"`
	HostURL string `json:"host_url"`
}

func (s *Server) postMachines(c echo.Context) error {
	// Read body
	body := &PostMachinesBody{}

	if err := c.Bind(body); err != nil {
		return echo.ErrBadRequest
	}

	// Validate fields
	if body.Name == "" || body.HostURL == "" {
		return echo.ErrBadRequest
	}

	ctx := c.Request().Context()

	// // Create and save a new api key
	// newApiKeyGenerated, err := generateAPIKey(32)
	// if err != nil {
	// 	c.Logger().Error(err)
	// 	return echo.ErrInternalServerError
	// }

	// newApiKey := &db.ApiKey{
	// 	ID:          primitive.NewObjectID(),
	// 	TypeOfToken: "machine",
	// 	CreatedAt:   primitive.NewDateTimeFromTime(time.Now()),
	// 	Deleted:     false,
	// 	Value:       newApiKeyGenerated,
	// }

	// result, err := s.Collections.ApiKeys.InsertOne(ctx, newApiKey, nil)
	// if err != nil {
	// 	c.Logger().Error(err)
	// 	return echo.ErrInternalServerError
	// }

	// apiKeyId, ok := result.InsertedID.(primitive.ObjectID)
	// if !ok {
	// 	c.Logger().Error(err)
	// 	return echo.ErrInternalServerError
	// }

	// Create machine
	newMachine := &db.Machine{
		ID:      primitive.NewObjectID(),
		Name:    body.Name,
		HostURL: body.HostURL,
		Deleted: false,
	}

	result, err := s.Collections.Machines.InsertOne(ctx, newMachine, nil)
	if err != nil {
		c.Logger().Error(err)
		return echo.ErrInternalServerError
	}

	findResult := s.Collections.Machines.FindOne(ctx, echo.Map{"_id": result.InsertedID})
	if findResult.Err() != nil {
		c.Logger().Error(err)
		return echo.ErrInternalServerError
	}

	insertedMachine := &MachineDto{}
	err = findResult.Decode(insertedMachine)
	if err != nil {
		c.Logger().Error(err)
		return echo.ErrInternalServerError
	}

	machineId := newMachine.ID.Hex()
	s.realTimeStatsSubject.NewMachine(machineId)

	// firstStage := bson.M{"$match": bson.M{"_id": result.InsertedID, "deleted": false}}
	// secondStage := bson.M{"$lookup": bson.M{
	// 	"from":         "api-keys",
	// 	"localField":   "current_api_key_id",
	// 	"foreignField": "_id",
	// 	"as":           "api_key",
	// }}

	// cursor, err := s.Collections.Machines.Aggregate(ctx, bson.A{firstStage, secondStage})
	// if err != nil {
	// 	c.Logger().Error(err)
	// 	return echo.ErrInternalServerError
	// }

	// var insertedMachine MachineDto
	// next := cursor.Next(ctx)
	// if !next {
	// 	c.Logger().Error(err)
	// 	return echo.ErrInternalServerError
	// }
	// if err := cursor.Decode(&insertedMachine); err != nil {
	// 	c.Logger().Error(err)
	// 	return echo.ErrInternalServerError
	// }
	// if err := cursor.Err(); err != nil {
	// 	c.Logger().Error(err)
	// 	return echo.ErrInternalServerError
	// }

	return c.JSON(http.StatusOK, insertedMachine)
}

func (s *Server) deleteMachines(c echo.Context) error {
	idParam := c.Param("id")

	objId, err := primitive.ObjectIDFromHex(idParam)
	if err != nil {
		return echo.ErrBadRequest
	}

	ctx := c.Request().Context()

	result, err := s.Collections.Machines.UpdateByID(ctx, objId, bson.M{
		"$set": bson.M{
			"deleted": true,
		},
	}, nil)

	if err != nil {
		c.Logger().Error(err)
		return echo.ErrInternalServerError
	}

	if result.MatchedCount != 1 {
		return echo.ErrNotFound
	}

	// // asynchronously revoke the current key of the deleted document
	// go func() {
	// 	// REVIEW: Even though it's currently revoking the machine's api key, it's not revoking the api keys that
	// 	// are associated to the machine
	// 	ctx := context.Background()

	// 	res := s.Collections.Machines.FindOne(ctx, bson.M{
	// 		"_id": objId,
	// 	})
	// 	if err := res.Err(); err != nil {
	// 		c.Logger().Error(err)
	// 		return
	// 	}

	// 	machine := &db.Machine{}
	// 	err := res.Decode(machine)
	// 	if err != nil {
	// 		c.Logger().Error(err)
	// 		return
	// 	}

	// 	err = s.revokeApiKey(ctx, machine.CurrentApiKeyId)
	// 	if err != nil {
	// 		c.Logger().Error(err)
	// 	}
	// }()

	return c.NoContent(http.StatusOK)
}
