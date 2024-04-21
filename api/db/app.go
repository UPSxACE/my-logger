package db

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type App struct {
	ID              primitive.ObjectID `json:"id" bson:"_id"`
	Name            string             `json:"name" bson:"name"`
	Url             string             `json:"url" bson:"url"`
	MachineId       primitive.ObjectID `json:"machine_id" bson:"machine_id"`
	CurrentApiKeyId primitive.ObjectID `json:"current_api_key_id" bson:"current_api_key_id"`
	Deleted         bool               `json:"-" bson:"deleted"`
}
