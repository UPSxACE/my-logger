package db

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Machine struct {
	ID      primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Name    string             `json:"name" bson:"name"`
	HostURL string             `json:"host_url" bson:"host_url"`
	Deleted bool               `json:"-" bson:"deleted"`
}
