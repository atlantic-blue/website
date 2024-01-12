package main

import (
	emailLambda "email-forwarder/internal/lambda"
	"errors"
	"log"
	"os"
	"strings"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/sirupsen/logrus"
	"github.com/urfave/cli/v2"
	"golang.org/x/sync/errgroup"
)

func ReceiveMail(event events.SimpleEmailEvent) (interface{}, error) {
	return event, nil
}

var (
	config struct {
		LogLevel  string
		LogOutput string

		MailBucket            string
		MailForwardBouncePath string

		MailForwardAsName  string
		MailForwardAsEmail string

		MailForwardToName  string
		MailForwardToEmail string
	}

	appFlags = []cli.Flag{
		&cli.StringFlag{
			Name:        "log-level",
			Usage:       "Log Level",
			EnvVars:     []string{"LOG_LEVEL"},
			Value:       "info",
			Destination: &config.LogLevel,
		},
		&cli.StringFlag{
			Name:        "log-output",
			Usage:       "Log Output (text, json)",
			EnvVars:     []string{"LOG_OUTPUT"},
			Value:       "json",
			Destination: &config.LogOutput,
		},

		&cli.StringFlag{
			Name:        "log-output",
			Usage:       "Log Output (text, json)",
			EnvVars:     []string{"MAIL_BUCKET"},
			Value:       "",
			Destination: &config.MailBucket,
		},
		&cli.StringFlag{
			Name:        "log-output",
			Usage:       "Log Output (text, json)",
			EnvVars:     []string{"MAIL_FORWARD_BOUNCE_PATH"},
			Value:       "",
			Destination: &config.MailForwardBouncePath,
		},

		&cli.StringFlag{
			Name:        "log-output",
			Usage:       "Log Output (text, json)",
			EnvVars:     []string{"MAIL_FORWARD_AS_NAME"},
			Value:       "",
			Destination: &config.MailForwardAsName,
		},
		&cli.StringFlag{
			Name:        "log-output",
			Usage:       "Log Output (text, json)",
			EnvVars:     []string{"MAIL_FORWARD_AS_EMAIL"},
			Value:       "",
			Destination: &config.MailForwardAsEmail,
		},
		&cli.StringFlag{
			Name:        "log-output",
			Usage:       "Log Output (text, json)",
			EnvVars:     []string{"MAIL_FORWARD_TO_NAME"},
			Value:       "",
			Destination: &config.MailForwardToName,
		},
		&cli.StringFlag{
			Name:        "log-output",
			Usage:       "Log Output (text, json)",
			EnvVars:     []string{"MAIL_FORWARD_TO_EMAIL"},
			Value:       "",
			Destination: &config.MailForwardToEmail,
		},
	}
)

func appAction(cliCtx *cli.Context) error {
	if err := NewLogger(config.LogLevel, config.LogOutput); err != nil {
		return err
	}

	ctx := cliCtx.Context
	errorGroup, ctx := errgroup.WithContext(ctx)

	errorGroup.Go(func() error {
		handler := emailLambda.EmailForwarder(ctx, emailLambda.MailConfig{
			Bucket:            config.MailBucket,
			ForwardBouncePath: config.MailForwardBouncePath,

			ForwardToName:  config.MailForwardToEmail,
			ForwardToEmail: config.MailForwardToEmail,

			ForwardAsName:  config.MailForwardAsName,
			ForwardAsEmail: config.MailForwardAsEmail,
		})

		lambda.Start(handler)
		return nil
	})

	return errorGroup.Wait()
}

func main() {
	lambda.Start(ReceiveMail)
	app := cli.NewApp()
	app.Flags = appFlags
	app.Name = "email-forwarder"
	app.Action = appAction

	if err := app.Run(os.Args); err != nil {
		log.Fatal(err)
	}
}

const (
	// ErrorLoggerLogLevel 1
	ErrorLoggerLogLevel = "[ Logger ] log level is empty"
	// ErrorLoggerLogLevelParse 2
	ErrorLoggerLogLevelParse = "[ Logger ] failed to parse log level"
)

func NewLogger(level, format string) error {
	if level == "" {
		return errors.New(ErrorLoggerLogLevel)
	}

	logrusLevel, err := logrus.ParseLevel(level)
	if err != nil {
		return errors.New(ErrorLoggerLogLevelParse)
	}
	logrus.SetLevel(logrusLevel)

	logrusFormat := strings.ToLower(format)

	switch logrusFormat {
	case "text":
		logrus.SetFormatter(&logrus.TextFormatter{})
	default:
		logrus.SetFormatter(&logrus.JSONFormatter{})
	}
	return nil
}
