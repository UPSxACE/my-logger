package server

import (
	"bytes"
	"context"
	"errors"
	"html/template"
	"log"
	"os"
	"strconv"
	"time"

	"github.com/UPSxACE/my-logger/api/db"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"gopkg.in/gomail.v2"
)

type emailConfirmationTemplateData struct {
	Username string
	Url      string
}

func (s *Server) setupEmailTemplates() {
	t := template.New("")

	t, err := t.ParseGlob("templates/*.html")
	if err != nil {
		log.Fatal(err)
	}

	s.emailTemplates = t
}

func SendEmail(to string, subject string, body string) error {
	SMTP_HOST := os.Getenv("SMTP_HOST")
	SMTP_PORT_STR := os.Getenv("SMTP_PORT")
	SMTP_PORT, err := strconv.Atoi(SMTP_PORT_STR)
	if err != nil {
		return err
	}
	SMTP_USERNAME := os.Getenv("SMTP_USERNAME")
	SMTP_PASSWORD := os.Getenv("SMTP_PASSWORD")

	m := gomail.NewMessage()
	m.SetHeader("From", SMTP_USERNAME)
	m.SetHeader("To", to)
	// m.SetAddressHeader("Cc", "<RECIPIENT CC>", "<RECIPIENT CC NAME>")
	m.SetHeader("Subject", subject)
	m.SetBody("text/html", body)

	d := gomail.NewDialer(SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD)

	if err := d.DialAndSend(m); err != nil {
		return err
	}

	return nil
}

func (s *Server) sendEmailConfirmationEmail(ctx context.Context, userId any, username string, email string) error {
	var id string

	if oid, ok := userId.(primitive.ObjectID); ok {
		id = oid.Hex()
	} else {
		oid, ok := userId.(string)
		if !ok {
			return errors.New("userId is neither ObjectID nor string")
		}
		id = oid
	}

	userIdObjectId, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}

	newConfirmationToken := db.ConfirmationToken{
		ID:          primitive.NewObjectID(),
		UserId:      userIdObjectId,
		AlreadyUsed: false,
	}

	// generate confirmation token
	insertedToken, err := s.Collections.ConfirmationTokens.InsertOne(ctx, newConfirmationToken, nil)
	if err != nil {
		return err
	}

	insertedTokenId, ok := insertedToken.InsertedID.(primitive.ObjectID)
	if !ok {
		return errors.New("failed creating a confirmation email token")
	}

	NEXT_URL := os.Getenv("NEXT_URL")
	data := emailConfirmationTemplateData{
		Username: username,
		Url:      NEXT_URL + "/confirm?code=" + insertedTokenId.Hex(),
	}

	var tpl bytes.Buffer
	if err := s.emailTemplates.ExecuteTemplate(&tpl, "confirmation-email.html", data); err != nil {
		return err
	}

	resultTemplate := tpl.String()
	if err := SendEmail(email, "Please confirm your email!", resultTemplate); err != nil {
		return err
	}

	return nil
}

func (s *Server) sendRecoveryEmail(ctx context.Context, userId any, username string, email string) error {
	var id string

	if oid, ok := userId.(primitive.ObjectID); ok {
		id = oid.Hex()
	} else {
		oid, ok := userId.(string)
		if !ok {
			return errors.New("userId is neither ObjectID nor string")
		}
		id = oid
	}

	userIdObjectId, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}

	// generate token
	validUntil := time.Now().Add(time.Hour * 24)
	newRecoveryToken := &db.RecoveryToken{
		ID:          primitive.NewObjectID(),
		UserId:      userIdObjectId,
		AlreadyUsed: false,
		ValidUntil:  primitive.NewDateTimeFromTime(validUntil),
	}

	// generate confirmation token
	insertedToken, err := s.Collections.RecoveryTokens.InsertOne(ctx, newRecoveryToken, nil)
	if err != nil {
		return err
	}

	insertedTokenId, ok := insertedToken.InsertedID.(primitive.ObjectID)
	if !ok {
		return errors.New("failed creating a recovery email token")
	}

	NEXT_URL := os.Getenv("NEXT_URL")
	data := emailConfirmationTemplateData{
		Username: username,
		Url:      NEXT_URL + "/recover-account?code=" + insertedTokenId.Hex(),
	}

	var tpl bytes.Buffer
	if err := s.emailTemplates.ExecuteTemplate(&tpl, "recover-email.html", data); err != nil {
		return err
	}

	resultTemplate := tpl.String()
	if err := SendEmail(email, "Recover your account", resultTemplate); err != nil {
		return err
	}

	return nil
}
