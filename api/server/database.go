package server

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/UPSxACE/my-logger/api/db"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

const DB_NAME = "my-logger"

func (s *Server) setupDatabase(devMode bool) {
	URI := os.Getenv("MONGODB_URI")
	ctx := context.Background()

	// Set client options
	clientOptions := options.Client().ApplyURI(URI)
	// Connect to MongoDB
	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Fatal(err)
	}

	// Check the connection
	err = client.Ping(context.TODO(), nil)
	if err != nil {
		log.Fatal(err)
	}

	dbName := DB_NAME
	if devMode {
		dbName = DB_NAME + "_dev"
	}

	usersCollection := client.Database(dbName).Collection("users")
	internalCollection := client.Database(dbName).Collection("internal")
	confirmationTokensCollection := client.Database(dbName).Collection("confirmation-tokens")
	recoveryTokensCollection := client.Database(dbName).Collection("recovery-tokens")

	s.Collections = db.Collections{
		Users:              usersCollection,
		Internal:           internalCollection,
		ConfirmationTokens: confirmationTokensCollection,
		RecoveryTokens:     recoveryTokensCollection,
	}

	fmt.Println("Connected to MongoDB!")
}
