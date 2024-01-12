package lambda

import (
	"bytes"
	"context"
	"fmt"
	"io"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/aws/aws-sdk-go/service/ses"
	"github.com/jhillyerd/enmime"
)

type MailConfig struct {
	Bucket            string
	ForwardBouncePath string

	ForwardAsName  string
	ForwardAsEmail string

	ForwardToName  string
	ForwardToEmail string
}

type MailHeaders struct {
	subject string
	from    string
	to      string
}

func rewriteEmail(emailBody io.Reader, config MailConfig) ([]byte, error) {
	envelope, err := enmime.ReadEnvelope(emailBody)
	if err != nil {
		return nil, fmt.Errorf("could not read mail partds: %w", err)
	}

	// Read current subject, sender, and destination
	mailHeader := MailHeaders{
		subject: envelope.GetHeader("Subject"),
		from:    envelope.GetHeader("From"),
		to:      envelope.GetHeader("To"),
	}

	// Rewrite sender
	err = envelope.SetHeader("From", []string{fmt.Sprintf("%s <%s>", config.ForwardAsName, config.ForwardAsEmail)})
	if err != nil {
		return nil, fmt.Errorf("could not update from: %w", err)
	}

	// Rewrite destination
	err = envelope.SetHeader("To", []string{fmt.Sprintf("%s <%s>", config.ForwardToName, config.ForwardToEmail)})
	if err != nil {
		return nil, fmt.Errorf("could not update destination: %w", err)
	}

	// Set bounce target
	err = envelope.SetHeader("Return-Path", []string{config.ForwardBouncePath})
	if err != nil {
		return nil, fmt.Errorf("could not update return bounce path: %w", err)
	}

	// Set current origin as "Reply To"
	err = envelope.SetHeader("Reply-To", []string{mailHeader.from})
	if err != nil {
		return nil, fmt.Errorf("could not update reply-to: %w", err)
	}

	// Update subject to include Fwd
	err = envelope.SetHeader("Subject", []string{fmt.Sprintf("Fwd: (%s) %s", mailHeader.to, mailHeader.subject)})
	if err != nil {
		return nil, fmt.Errorf("could not update subject: %w", err)
	}

	buf := &bytes.Buffer{}
	err = envelope.Root.Encode(buf)
	if err != nil {
		return nil, fmt.Errorf("could not encode updated mail: %w", err)
	}

	return buf.Bytes(), nil
}

func EmailForwarder(ctx context.Context, config MailConfig) func(event events.SimpleEmailEvent) (interface{}, error) {
	return func(event events.SimpleEmailEvent) (interface{}, error) {
		awsConfig := aws.NewConfig()
		session, err := session.NewSession(awsConfig)
		if err != nil {
			return nil, fmt.Errorf("could not create session: %w", err)
		}

		s3Client := s3.New(session)
		mailClient := ses.New(session)

		for _, record := range event.Records {
			obj, err := s3Client.GetObject(&s3.GetObjectInput{
				Bucket: aws.String(config.Bucket),
				Key:    aws.String(record.SES.Mail.MessageID),
			})
			if err != nil {
				return nil, fmt.Errorf("could not get object: %w", err)
			}

			re, err := rewriteEmail(obj.Body, config)
			if err != nil {
				return nil, fmt.Errorf("could not rewrite mail: %w", err)
			}

			// SEND EMAIL
			_, err = mailClient.SendRawEmail(&ses.SendRawEmailInput{
				ConfigurationSetName: aws.String("mailing-default"),
				RawMessage: &ses.RawMessage{
					Data: re,
				},
			})

			if err != nil {
				return nil, fmt.Errorf("could not forward mail: %w", err)
			}

			// DELETE EMAIL FROM BUCKET
			_, err = s3Client.DeleteObject(&s3.DeleteObjectInput{
				Bucket: aws.String(config.Bucket),
				Key:    aws.String(record.SES.Mail.MessageID),
			})
			if err != nil {
				return nil, fmt.Errorf("could not delete email from s3: %w", err)
			}
		}

		return event, nil
	}
}
