package server

import (
	"net/http"

	"github.com/UPSxACE/my-logger/api/db"
	"github.com/labstack/echo/v4"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type AppDto struct {
	Id      string       `json:"id" bson:"_id"`
	Name    string       `json:"name" bson:"name"`
	URL     string       `json:"url" bson:"url"`
	Machine []db.Machine `json:"machine" bson:"machine"`
}

func (s *Server) getApps(c echo.Context) error {
	ctx := c.Request().Context()

	apps := []AppDto{}

	// findResult, err := s.Collections.Apps.Find(ctx, echo.Map{"deleted": false})
	// if err != nil {
	// 	c.Logger().Error(err)
	// 	return echo.ErrInternalServerError
	// }
	// err = findResult.All(ctx, &apps)

	// find and populate data
	firstStage := bson.M{"$match": bson.M{"deleted": false}}
	secondStage := bson.M{"$lookup": bson.M{
		"from":         "machines",
		"localField":   "machine_id",
		"foreignField": "_id",
		"as":           "machine",
	}}

	cursor, err := s.Collections.Apps.Aggregate(ctx, bson.A{firstStage, secondStage})
	if err != nil {
		c.Logger().Error(err)
		return echo.ErrInternalServerError
	}

	for cursor.Next(ctx) {
		var result AppDto
		if err := cursor.Decode(&result); err != nil {
			c.Logger().Error(err)
			return echo.ErrInternalServerError
		}
		apps = append(apps, result)
	}

	if err := cursor.Err(); err != nil {
		c.Logger().Error(err)
		return echo.ErrInternalServerError
	}

	return c.JSON(http.StatusOK, apps)
}

type PostAppsBody struct {
	Name      string `json:"name"`
	Url       string `json:"url"`
	MachineId string `json:"machine_id"`
}

func (s *Server) postApps(c echo.Context) error {
	// Read body
	body := &PostAppsBody{}

	if err := c.Bind(body); err != nil {
		return echo.ErrBadRequest
	}

	// Validate fields
	if body.Name == "" || body.Url == "" || body.MachineId == "" {
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

	// // Create and save a new api key
	// newApiKeyGenerated, err := generateAPIKey(32)
	// if err != nil {
	// 	c.Logger().Error(err)
	// 	return echo.ErrInternalServerError
	// }

	// newApiKey := &db.ApiKey{
	// 	ID:          primitive.NewObjectID(),
	// 	TypeOfToken: "app",
	// 	CreatedAt:   primitive.NewDateTimeFromTime(time.Now()),
	// 	Deleted:     false,
	// 	Value:       newApiKeyGenerated,
	// }

	// sResult, err := s.Collections.ApiKeys.InsertOne(ctx, newApiKey, nil)
	// if err != nil {
	// 	c.Logger().Error(err)
	// 	return echo.ErrInternalServerError
	// }

	// apiKeyId, ok := sResult.InsertedID.(primitive.ObjectID)
	// if !ok {
	// 	c.Logger().Error(err)
	// 	return echo.ErrInternalServerError
	// }

	// Create app
	newApp := &db.App{
		ID:        primitive.NewObjectID(),
		Name:      body.Name,
		Url:       body.Url,
		MachineId: machine.ID,
		Deleted:   false,
	}

	sResult, err := s.Collections.Apps.InsertOne(ctx, newApp, nil)
	if err != nil {
		c.Logger().Error(err)
		return echo.ErrInternalServerError
	}

	findResult := s.Collections.Apps.FindOne(ctx, echo.Map{"_id": sResult.InsertedID})
	if findResult.Err() != nil {
		c.Logger().Error(err)
		return echo.ErrInternalServerError
	}

	insertedApp := &AppDto{}
	err = findResult.Decode(insertedApp)
	if err != nil {
		c.Logger().Error(err)
		return echo.ErrInternalServerError
	}

	// firstStage := bson.M{"$match": bson.M{"_id": sResult.InsertedID, "deleted": false}}
	// secondStage := bson.M{"$lookup": bson.M{
	// 	"from":         "api-keys",
	// 	"localField":   "current_api_key_id",
	// 	"foreignField": "_id",
	// 	"as":           "api_key",
	// }}
	// thirdStage := bson.M{"$lookup": bson.M{
	// 	"from":         "machines",
	// 	"localField":   "machine_id",
	// 	"foreignField": "_id",
	// 	"as":           "machine",
	// }}

	// cursor, err := s.Collections.Apps.Aggregate(ctx, bson.A{firstStage, secondStage, thirdStage})
	// if err != nil {
	// 	c.Logger().Error(err)
	// 	return echo.ErrInternalServerError
	// }

	// var insertedApp AppDto
	// next := cursor.Next(ctx)
	// if !next {
	// 	c.Logger().Error(err)
	// 	return echo.ErrInternalServerError
	// }
	// if err := cursor.Decode(&insertedApp); err != nil {
	// 	c.Logger().Error(err)
	// 	return echo.ErrInternalServerError
	// }
	// if err := cursor.Err(); err != nil {
	// 	c.Logger().Error(err)
	// 	return echo.ErrInternalServerError
	// }

	return c.JSON(http.StatusOK, insertedApp)
}

func (s *Server) deleteApps(c echo.Context) error {
	idParam := c.Param("id")

	objId, err := primitive.ObjectIDFromHex(idParam)
	if err != nil {
		return echo.ErrBadRequest
	}

	ctx := c.Request().Context()

	result, err := s.Collections.Apps.UpdateByID(ctx, objId, bson.M{
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
	// 	ctx := context.Background()

	// 	res := s.Collections.Apps.FindOne(ctx, bson.M{
	// 		"_id": objId,
	// 	})
	// 	if err := res.Err(); err != nil {
	// 		c.Logger().Error(err)
	// 		return
	// 	}

	// 	app := &db.App{}
	// 	err := res.Decode(app)
	// 	if err != nil {
	// 		c.Logger().Error(err)
	// 		return
	// 	}

	// 	err = s.revokeApiKey(ctx, app.CurrentApiKeyId)
	// 	if err != nil {
	// 		c.Logger().Error(err)
	// 	}
	// }()

	return c.NoContent(http.StatusOK)
}
