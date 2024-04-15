package db

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID             primitive.ObjectID `json:"id" bson:"_id"`
	Username       string             `json:"username" bson:"username"`
	Password       string             `json:"password" bson:"password"`
	Email          string             `json:"email" bson:"email"`
	AvatarUrl      string             `json:"avatar_url" bson:"avatar_url"`
	RoleID         int                `json:"role_id" bson:"role_id"`
	EmailConfirmed bool               `json:"-" bson:"email_confirmed"`
	Deleted        bool
}
