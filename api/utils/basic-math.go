package utils

import "math/rand"

func RandomIntBetween(min int, max int) int {
	return (rand.Intn(max-min+1) + min)
}
