package server

import (
	"context"
	"fmt"
	"log"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type InternalState struct {
	ownerRegistered bool
}

type DocumentInternalOwnerRegistered struct {
	ID         primitive.ObjectID `json:"id" bson:"_id"`
	StateName  string             `json:"state_name" bson:"state_name"`
	StateValue bool               `json:"state_value" bson:"state_value"`
}

func (s *Server) setupInternalState() {
	fmt.Println("Checking internal state...")
	result := s.Collections.Internal.FindOne(context.TODO(), bson.M{"state_name": "ownerRegistered"}, &options.FindOneOptions{})
	err := result.Err()
	if err != nil {
		if err != mongo.ErrNoDocuments {
			log.Fatal(err)
		}

		fmt.Println("No owner was registered yet.")
		s.internal.ownerRegistered = false
		return
	}

	internalStateOwnerRegistered := &DocumentInternalOwnerRegistered{}
	err = result.Decode(internalStateOwnerRegistered)
	if err != nil {
		log.Fatal(err)
	}

	ownerRegistered := internalStateOwnerRegistered.StateValue
	if !ownerRegistered {
		fmt.Println("No owner was registered yet.")
	}

	s.internal.ownerRegistered = ownerRegistered
}
