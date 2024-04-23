package db

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// TODO: add created_at, updated_at, deleted_at, and fill on create account
type User struct {
	ID             primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Username       string             `json:"username" bson:"username"`
	Password       string             `json:"password" bson:"password"`
	Email          string             `json:"email" bson:"email"`
	AvatarUrl      string             `json:"avatar_url" bson:"avatar_url"`
	RoleID         int                `json:"role_id" bson:"role_id"`
	EmailConfirmed bool               `json:"-" bson:"email_confirmed"`
	Deleted        bool               `json:"-" bson:"deleted"`
}
