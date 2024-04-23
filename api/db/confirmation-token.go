package db

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type ConfirmationToken struct {
	ID          primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	UserId      primitive.ObjectID `json:"user_id" bson:"user_id"`
	AlreadyUsed bool               `json:"already_used" bson:"already_used"`
}
