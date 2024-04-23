package utils

import "github.com/google/uuid"

func generate() string {
	id, err := uuid.NewRandom()
	if err != nil {
		return generate()
	}
	return id.String()
}

func GenerateUuid() string {
	return generate()
}
