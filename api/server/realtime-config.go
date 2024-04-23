package server

import (
	"context"
	"fmt"
	"log"

	"github.com/UPSxACE/my-logger/api/db"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// if there is changes on the config, everyone must have their
// window locked and be notified to refresh their browsers!
// automatically refresh in 3 seconds
type RealtimeConfig struct {
	RealtimeUsageMachinesToTrack []machineId `json:"machines_to_track" bson:"machines_to_track"`
}

type InternalRealtimeConfig struct {
	db.Internal `bson:",inline"`
	StateValue  RealtimeConfig `json:"state_value" bson:"state_value"`
}

func (s *Server) LoadRealtimeConfig() RealtimeConfig {
	config := RealtimeConfig{}

	// fetch from database if it exists
	ctx := context.Background()
	result := s.Collections.Internal.FindOne(ctx, bson.M{"state_name": "realtimeConfig"})
	if err := result.Err(); err != nil {
		if err != mongo.ErrNoDocuments {
			log.Fatal(err)
		}

		// load default settings
		config.RealtimeUsageMachinesToTrack = []machineId{}
		return config
	}

	internalDocument := &InternalRealtimeConfig{}
	err := result.Decode(internalDocument)
	if err != nil {
		log.Fatal(err)
	}
	valueConfig := internalDocument.StateValue

	return valueConfig
}

func (s *Server) SaveRealtimeConfig(newConfig RealtimeConfig) error {
	s.realTimeStatsSubject.mu.Lock()
	defer s.realTimeStatsSubject.mu.Unlock()

	ctx := context.Background()

	_, err := s.Collections.Internal.UpdateOne(ctx, bson.M{
		"state_name": "realtimeConfig",
	}, bson.M{
		"$set": InternalRealtimeConfig{
			Internal: db.Internal{
				StateName: "realtimeConfig",
			},
			StateValue: newConfig,
		},
	}, options.Update().SetUpsert(true))

	if err != nil {
		fmt.Println("This shouldn't happen. Is the database offline?")
		return err
	}

	// notify change
	s.realTimeStatsSubject.Config = newConfig
	s.realTimeStatsSubject.NotifyConfigChange()

	return nil
}
