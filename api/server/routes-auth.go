package server

import (
	"net/http"
	"time"

	"github.com/UPSxACE/my-logger/api/db"
	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v4"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
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
	// TODO: check email confirmed
	login := &PostLoginBody{}

	if err := c.Bind(login); err != nil {
		return echo.ErrBadRequest
	}

	ctx := c.Request().Context()

	result := s.Collections.Users.FindOne(ctx, bson.M{"username": login.Username})
	err := result.Err()
	if err != nil {
		if err != mongo.ErrNoDocuments {
			return echo.ErrInternalServerError
		}
		return echo.ErrNotFound
	}

	user := &db.User{}
	if err := result.Decode(user); err != nil {
		c.Logger().Error(err)
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
	if s.internal.ownerRegistered {
		return echo.ErrUnauthorized
	}

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

	// TODO: start transaction
	// REVIEW: really necessary before sending into production!
	// Save
	hashedPassword, err := HashPassword(register.Password)
	if err != nil {
		c.Logger().Error(err)
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

	insertedUser, err := s.Collections.Users.InsertOne(ctx, newUser, nil)
	if err != nil {
		c.Logger().Error(err)
		return echo.ErrInternalServerError
	}

	// send email
	err = s.sendEmailConfirmationEmail(ctx, insertedUser.InsertedID, newUser.Username, newUser.Email)
	if err != nil {
		c.Logger().Error(err)
		return echo.ErrInternalServerError
	}

	return c.NoContent(http.StatusCreated)
}

func (s *Server) postConfirmEmailRoute(c echo.Context) error {
	if s.internal.ownerRegistered {
		return echo.ErrUnauthorized
	}

	code := c.QueryParam("code")
	if code == "" {
		return echo.ErrBadRequest
	}

	codeObjId, err := primitive.ObjectIDFromHex(code)
	if err != nil {
		return echo.ErrNotFound
	}

	ctx := c.Request().Context()

	result := s.Collections.ConfirmationTokens.FindOne(ctx, bson.M{"_id": codeObjId}, nil)
	confirmationToken := &db.ConfirmationToken{}
	err = result.Decode(confirmationToken)
	if err != nil || confirmationToken.AlreadyUsed {
		return echo.ErrNotFound
	}

	_, err = s.Collections.ConfirmationTokens.UpdateByID(ctx, confirmationToken.ID, bson.M{"$set": bson.M{"already_used": true}}, nil)
	if err != nil {
		return echo.ErrInternalServerError
	}

	ownerRegistered := &InternalOwnerRegistered{
		Internal: db.Internal{
			ID:        primitive.NewObjectID(),
			StateName: "ownerRegistered",
		},
		StateValue: true,
	}

	// delete in case it exists in database
	_ = s.Collections.Internal.FindOneAndDelete(ctx, bson.M{"state_name": "ownerRegistered"}, nil)

	_, err = s.Collections.Internal.InsertOne(ctx, ownerRegistered, nil)
	if err != nil {
		return echo.ErrInternalServerError
	}

	s.internal.ownerRegistered = true
	return c.NoContent(200)
}

func (s *Server) postForgotPasswordRoute(c echo.Context) error {
	email := c.QueryParam("email")
	if email == "" {
		return echo.ErrBadRequest
	}

	// Check email format
	match, _ := emailRegex.MatchString(email)
	if !match {
		return echo.ErrBadRequest
	}

	ctx := c.Request().Context()
	// Find user
	result := s.Collections.Users.FindOne(ctx, bson.M{"email": email})
	err := result.Err()
	if err != nil {
		if err != mongo.ErrNoDocuments {
			return echo.ErrInternalServerError
		}
		return echo.ErrNotFound
	}

	user := &db.User{}
	if err := result.Decode(user); err != nil {
		c.Logger().Error(err)
		return echo.ErrInternalServerError
	}

	// send email
	err = s.sendRecoveryEmail(ctx, user.ID, user.Username, user.Email)
	if err != nil {
		c.Logger().Error(err)
		return echo.ErrInternalServerError
	}

	return c.NoContent(200)
}

type PostRecoverAccountBody struct {
	NewPassword string `json:"new_password"`
}

func (s *Server) postRecoverAccountRoute(c echo.Context) error {
	code := c.QueryParam("code")
	if code == "" {
		return echo.ErrBadRequest
	}

	codeObjId, err := primitive.ObjectIDFromHex(code)
	if err != nil {
		return echo.ErrNotFound
	}

	body := &PostRecoverAccountBody{}
	err = c.Bind(body)
	if err != nil {
		return echo.ErrBadRequest
	}

	match, _ := passwordRegex.MatchString(body.NewPassword)
	if !match {
		return echo.ErrBadRequest
	}

	ctx := c.Request().Context()

	result := s.Collections.RecoveryTokens.FindOne(ctx, bson.M{"_id": codeObjId}, nil)
	recoveryToken := &db.RecoveryToken{}
	err = result.Decode(recoveryToken)
	if err != nil || recoveryToken.AlreadyUsed || time.Now().Compare(recoveryToken.ValidUntil.Time()) >= 0 {
		return echo.ErrNotFound
	}

	_, err = s.Collections.RecoveryTokens.UpdateByID(ctx, recoveryToken.ID, bson.M{"$set": bson.M{"already_used": true}}, nil)
	if err != nil {
		return echo.ErrInternalServerError
	}

	// hash new password
	hashedPassword, err := HashPassword(body.NewPassword)
	if err != nil {
		c.Logger().Error(err)
		return echo.ErrInternalServerError
	}

	// find user and set new password
	_, err = s.Collections.Users.UpdateByID(ctx, recoveryToken.UserId, bson.M{"$set": bson.M{"password": hashedPassword}})
	if err != nil {
		return echo.ErrInternalServerError
	}

	return c.NoContent(200)
}
