package server

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func generateAPIKey(length int) (string, error) {
	// Determine the number of bytes needed to represent the key
	numBytes := length / 4 * 3 // base64 encoding requires 4 bytes to represent 3 bytes of input
	if length%4 != 0 {
		numBytes += 3 // padding for base64 encoding
	}

	// Generate random bytes
	randBytes := make([]byte, numBytes)
	_, err := rand.Read(randBytes)
	if err != nil {
		return "", err
	}

	// Encode random bytes to base64
	apiKey := base64.URLEncoding.EncodeToString(randBytes)

	// Trim any padding '=' characters
	apiKey = apiKey[:length]

	return apiKey, nil
}

func (s *Server) revokeApiKey(ctx context.Context, keyId any) error {
	var id primitive.ObjectID
	var ok bool

	id, ok = keyId.(primitive.ObjectID)
	if !ok {
		stringObjId, ok := keyId.(string)
		if !ok {
			return errors.New("userId is neither ObjectID nor string")
		}

		oid, err := primitive.ObjectIDFromHex(stringObjId)
		if err != nil {
			return err
		}

		id = oid
	}

	_, err := s.Collections.ApiKeys.UpdateByID(ctx, id, bson.M{
		"$set": bson.M{
			"revoked_at": time.Now(),
		},
	})

	if err != nil {
		return err
	}

	return nil
}
