package db

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type RecoveryToken struct {
	ID          primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	UserId      primitive.ObjectID `json:"user_id" bson:"user_id"`
	AlreadyUsed bool               `json:"already_used" bson:"already_used"`
	ValidUntil  primitive.DateTime `json:"valid_until" bson:"valid_until"`
}
