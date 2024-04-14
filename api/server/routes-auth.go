package server

import (
	"fmt"
	"net/http"

	"github.com/UPSxACE/my-logger/api/db"
	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v4"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

const USER_DEFAULT_ROLE_ID = 1
const USER_DEFAULT_PERMISSIONS = 0
const USER_DEFAULT_AVATAR_URL = "/default-avatar.png"

type PostLoginBody struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type PostLoginDto struct {
	Username    string             `json:"username"`
	UserId      primitive.ObjectID `json:"userId"`
	Permissions int                `json:"permissions"`
}

func (s *Server) postLoginRoute(c echo.Context) error {
	login := &PostLoginBody{}

	if err := c.Bind(login); err != nil {
		return echo.ErrBadRequest
	}

	ctx := c.Request().Context()

	result := s.Collections.Users.FindOne(ctx, bson.M{"username": login.Username})
	if result.Err() != nil {
		return echo.ErrNotFound
	}

	user := &db.User{}
	if err := result.Decode(user); err != nil {
		fmt.Println(err)
		return echo.ErrInternalServerError
	}

	match, _ := ComparePasswordAndHash(login.Password, user.Password)
	if !match {
		return echo.ErrBadRequest
	}

	// NOTE: Tokens are created on NextJS, with  NextAuth. Just return the necessary info for the jwt claims
	permissions := 0
	if user.RoleID == 2 {
		permissions = 1
	}

	data := PostLoginDto{
		UserId:      user.ID,
		Username:    user.Username,
		Permissions: permissions,
	}

	return c.JSON(http.StatusOK, data)
}

type PostRegisterBody struct {
	Username string `json:"username" validate:"required,username"`
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,password"`
}

func (s *Server) postRegisterRoute(c echo.Context) error {
	// Read body
	register := &PostRegisterBody{}

	if err := c.Bind(register); err != nil {
		return echo.ErrBadRequest
	}

	// Validate fields
	err := s.validator.Struct(register)
	if err != nil {
		errs := err.(validator.ValidationErrors)
		if len(errs) > 0 {
			return c.JSON(http.StatusBadRequest, echo.Map{"field": errs[0].Field()})
		}
	}

	// Check if email and username aren't used already
	ctx := c.Request().Context()

	result := s.Collections.Users.FindOne(ctx, bson.M{"username": register.Username})
	if result.Err() == nil {
		return c.JSON(http.StatusConflict, echo.Map{"field": "username"})
	}
	result = s.Collections.Users.FindOne(ctx, bson.M{"email": register.Email})
	if result.Err() == nil {
		return c.JSON(http.StatusConflict, echo.Map{"field": "email"})
	}

	// Save
	hashedPassword, err := HashPassword(register.Password)
	if err != nil {
		fmt.Println(err)
		return echo.ErrInternalServerError
	}

	newUser := db.User{
		ID:        primitive.NewObjectID(),
		Username:  register.Username,
		Password:  hashedPassword,
		Email:     register.Email,
		AvatarUrl: USER_DEFAULT_AVATAR_URL,
		RoleID:    USER_DEFAULT_ROLE_ID,
		Deleted:   false,
	}

	insertResult, err := s.Collections.Users.InsertOne(ctx, newUser, nil)
	if err != nil {
		fmt.Println(err)
		return echo.ErrInternalServerError
	}

	createdUserResult := s.Collections.Users.FindOne(ctx, bson.M{"_id": insertResult.InsertedID})
	if createdUserResult.Err() != nil {
		fmt.Println(err)
		return echo.ErrInternalServerError
	}

	createdUser := &db.User{}
	err = createdUserResult.Decode(createdUser)
	if err != nil {
		fmt.Println(err)
		return echo.ErrInternalServerError
	}

	// NOTE: Tokens are created on NextJS, with  NextAuth. Just return the necessary info for the jwt claims
	permissions := 0
	if createdUser.RoleID == 2 {
		permissions = 1
	}

	data := PostLoginDto{
		UserId:      createdUser.ID,
		Username:    createdUser.Username,
		Permissions: permissions,
	}

	return c.JSON(http.StatusOK, data)
}
