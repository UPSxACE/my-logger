package db

import "go.mongodb.org/mongo-driver/mongo"

type Collections struct {
	Users               *mongo.Collection
	Internal            *mongo.Collection
	ConfirmationTokens  *mongo.Collection
	RecoveryTokens      *mongo.Collection
	Machines            *mongo.Collection
	ApiKeys             *mongo.Collection
	Apps                *mongo.Collection
	ResourcesLog        *mongo.Collection
	AnalyticsCollection *mongo.Collection
}

// TODO: create collaction wrappers and make aggregation util functions to make it easier to populate relationships
