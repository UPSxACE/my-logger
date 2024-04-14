package db

import "go.mongodb.org/mongo-driver/mongo"

type Collections struct {
	Users *mongo.Collection
}
