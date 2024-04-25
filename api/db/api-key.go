package db

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type ApiKey struct {
	ID          primitive.ObjectID  `json:"id" bson:"_id,omitempty"`
	MachineId   primitive.ObjectID  `json:"machine_id" bson:"machine_id"`
	Value       string              `json:"value" bson:"value"`
	TypeOfToken string              `json:"type_of_token" bson:"type_of_token"`
	CreatedAt   primitive.DateTime  `json:"created_at" bson:"created_at"`
	RevokedAt   *primitive.DateTime `json:"revoked_at,omitempty" bson:"revoked_at,omitempty"`
	Deleted     bool                `json:"-" bson:"deleted"`
}
