package db

import "go.mongodb.org/mongo-driver/mongo"

type Collections struct {
	Users              *mongo.Collection
	Internal           *mongo.Collection
	ConfirmationTokens *mongo.Collection
	RecoveryTokens     *mongo.Collection
}
