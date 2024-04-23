package db

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Machine struct {
	ID              primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Name            string             `json:"name" bson:"name"`
	HostURL         string             `json:"host_url" bson:"host_url"`
	CurrentApiKeyId primitive.ObjectID `json:"current_api_key_id" bson:"current_api_key_id"`
	Deleted         bool               `json:"-" bson:"deleted"`
}
