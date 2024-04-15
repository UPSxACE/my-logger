package db

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Internal struct {
	ID         primitive.ObjectID `json:"id" bson:"_id"`
	StateName  string             `json:"state_name" bson:"state_name"`
	StateValue any                `json:"state_value" bson:"state_value"`
}
