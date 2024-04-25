package server

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/UPSxACE/my-logger/api/db"
	"github.com/labstack/echo/v4"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func (s *Server) postLogMachine(c echo.Context) error {
	ctx := c.Request().Context()
	// verify header
	apiKey := c.Request().Header.Get("X-Api-Key")
	result := s.Collections.ApiKeys.FindOne(ctx, bson.M{
		"type_of_token": "machine",
		"value":         apiKey,
		"revoked_at":    nil,
	})
	if result.Err() != nil {
		return echo.ErrUnauthorized
	}

	apiKeyDocument := &db.ApiKey{}
	err := result.Decode(apiKeyDocument)
	if err != nil {
		c.Logger().Error(err)
		return echo.ErrInternalServerError
	}

	machineDocument := &db.Machine{}
	result = s.Collections.Machines.FindOne(ctx, bson.M{"current_api_key_id": apiKeyDocument.ID})
	err = result.Decode(machineDocument)
	if err != nil {
		c.Logger().Error(err)
		return echo.ErrInternalServerError
	}

	resourceLog := &db.ResourcesLog{}
	err = c.Bind(resourceLog)
	if err != nil {
		return echo.ErrBadRequest
	}

	resourceLog.ID = primitive.NewObjectID()
	resourceLog.MachineId = machineDocument.ID
	_, err = s.Collections.ResourcesLog.InsertOne(ctx, resourceLog)
	if err != nil {
		c.Logger().Error(err)
		return echo.ErrInternalServerError
	}

	// update realtime stats asynchronously
	go func() {
		s.realTimeStatsSubject.ProcessLog(resourceLog)
	}()

	return c.NoContent(http.StatusOK)
}

type FluentBitLog struct {
	LogJsonString string `json:"log"`
}

func (s *Server) postLogApp(c echo.Context) error {
	ctx := c.Request().Context()
	// verify header
	apiKey := c.Request().Header.Get("X-Api-Key")
	result := s.Collections.ApiKeys.FindOne(ctx, bson.M{
		"value":      apiKey,
		"revoked_at": nil,
	})
	if result.Err() != nil {
		return echo.ErrUnauthorized
	}

	body_arr := []FluentBitLog{}

	err := c.Bind(&body_arr)
	if err != nil {
		return echo.ErrBadRequest
	}

	go func() {
		// asynchronously save logs
		logs := []any{}
		for _, log := range body_arr {
			jsonLog := make(map[string]any)
			err := json.Unmarshal([]byte(log.LogJsonString), &jsonLog)
			if err != nil {
				c.Logger().Error(err)
				continue
			}

			// register who sent this log
			jsonLog["_by"] = apiKey

			// convert cookie to key:value format
			if jsonLog["request_Cookie"] != nil {
				header := http.Header{}
				cookieStr, ok := jsonLog["request_Cookie"].(string)
				if ok {
					header.Add("Cookie", cookieStr)
					mockReq := http.Request{Header: header}
					cookies := mockReq.Cookies()
					transformedCookieObj := map[string]string{}
					for _, cookie := range cookies {
						transformedCookieObj[cookie.Name] = cookie.Value
					}
					jsonLog["request_Cookie"] = transformedCookieObj
				}
			}

			logs = append(logs, jsonLog)
		}
		s.Collections.RequestsLog.InsertMany(context.Background(), logs)
	}()

	return c.NoContent(http.StatusOK)
}
