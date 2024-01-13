# SES domain
resource "aws_ses_domain_identity" "domain_identity" {
  domain = var.domain_name
}

resource "aws_route53_record" "ses_verification" {
  zone_id = aws_route53_zone.www.id
  name    = "_amazonses.${var.domain_name}"
  type    = "TXT"
  records = [aws_ses_domain_identity.domain_identity.verification_token]
  ttl     = "600"
}

# DKIM
# https://docs.aws.amazon.com/ses/latest/dg/send-email-authentication-dkim.html
resource "aws_ses_domain_dkim" "email" {
  domain = aws_ses_domain_identity.domain_identity.domain
}

resource "aws_route53_record" "email_dkim_records" {
  count   = 3
  zone_id = aws_route53_zone.www.id
  name    = "${element(aws_ses_domain_dkim.email.dkim_tokens, count.index)}._domainkey.${var.domain_name}"
  type    = "CNAME"
  ttl     = "600"

  records = [
    "${element(aws_ses_domain_dkim.email.dkim_tokens, count.index)}.dkim.amazonses.com",
  ]
}

# SES mail to records
resource "aws_route53_record" "email-mx-records" {
  zone_id = aws_route53_zone.www.id
  name    = var.domain_name
  type    = "MX"
  ttl     = "600"

  records = [
    "10 inbound-smtp.us-east-1.amazonses.com",
    "10 inbound-smtp.us-east-1.amazonaws.com",
  ]
}

resource "aws_ses_email_identity" "email" {
  email = "hello@${var.domain_name}"
}

# S3 BUCKET
resource "aws_s3_bucket" "email_bucket" {
  acl    = "private"
  bucket = "email-${local.www_bucket_name}"

  tags = {
    application = "${lookup(local.tags, "application")}"
    environment = "${lookup(local.tags, "environment")}"
    gitRepo     = "${lookup(local.tags, "git_repo")}"
    managedBy   = "${lookup(local.tags, "managed_by")}"
  }
}

data "aws_caller_identity" "current" {}

data "aws_iam_policy_document" "email_bucket" {
  statement {
    effect    = "Allow"
    actions   = ["s3:PutObject"]
    resources = ["${aws_s3_bucket.email_bucket.arn}/*"]

    principals {
      identifiers = ["ses.amazonaws.com"]
      type        = "Service"
    }
    condition {
      test     = "StringEquals"
      values   = [data.aws_caller_identity.current.account_id]
      variable = "aws:Referer"
    }
  }

  statement {
    effect = "Allow"
    actions = [
      "s3:GetObject",
      // TODO enable later
      # "s3:DeleteObject"
    ]
    resources = ["${aws_s3_bucket.email_bucket.arn}/*"]

    principals {
      identifiers = ["lambda.amazonaws.com"]
      type        = "Service"
    }
  }
}

resource "aws_s3_bucket_policy" "email_bucket" {
  bucket = aws_s3_bucket.email_bucket.id
  policy = data.aws_iam_policy_document.email_bucket.json
}

# SES RULE SET
resource "aws_ses_receipt_rule_set" "email_rule_set" {
  rule_set_name = "${var.domain_name}_email"
}

resource "aws_ses_active_receipt_rule_set" "email" {
  rule_set_name = aws_ses_receipt_rule_set.email_rule_set.rule_set_name
}

resource "aws_ses_receipt_rule" "email_rule" {
  name          = "${var.domain_name}_email"
  rule_set_name = aws_ses_receipt_rule_set.email_rule_set.rule_set_name
  enabled       = true
  scan_enabled  = true

  recipients = ["hello@atlanticblue.solutions"]

  s3_action {
    bucket_name = aws_s3_bucket.email_bucket.bucket
    position    = 1
  }

  lambda_action {
    function_arn = aws_lambda_function.email_lambda.arn
    topic_arn    = aws_sns_topic.email_topic.arn
    position     = 2
  }
}

# SNS TOPIC
resource "aws_sns_topic" "email_topic" {
  name       = "email_topic_${local.www_bucket_name}"
  fifo_topic = false
}

resource "aws_sns_topic_subscription" "email_topic_target" {
  topic_arn = aws_sns_topic.email_topic.arn
  protocol  = "email"
  endpoint  = var.email.forwardToEmail
}

#################################################
# Lambda
data "aws_iam_policy_document" "email_lambda_assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }

    actions = [
      "sts:AssumeRole"
    ]
  }
}

resource "aws_iam_policy" "email_lambda_access_s3" {
  name = "email_lambda_access_s3"
  policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        Action : [
          "s3:Put*",
          "s3:Get*",
          "s3:Delete*",
        ],
        Effect : "Allow",
        Resource : ["${aws_s3_bucket.email_bucket.arn}/*"]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "email_lambda_access_s3_policy_attachment" {
  role       = aws_iam_role.email_lambda.id
  policy_arn = aws_iam_policy.email_lambda_access_s3.arn
}

// Send raw email
resource "aws_iam_policy" "email_lambda_ses_send_raw_email" {
  name = "email_lambda_ses_send_raw_email"
  policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        Action : [
          "ses:SendEmail",
          "ses:SendRawEmail"
        ],
        Effect : "Allow",
        "Resource" : "*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "email_lambda_ses_send_raw_email_policy_attachment" {
  role       = aws_iam_role.email_lambda.id
  policy_arn = aws_iam_policy.email_lambda_ses_send_raw_email.arn
}


resource "aws_ses_configuration_set" "email_forward_lambda" {
  name = "aws_ses_configuration_set__email_forward"
}

resource "aws_iam_role" "email_lambda" {
  name               = "email_lambda"
  assume_role_policy = data.aws_iam_policy_document.email_lambda_assume_role.json

  tags = {
    application = "${lookup(local.tags, "application")}"
    environment = "${lookup(local.tags, "environment")}"
    gitRepo     = "${lookup(local.tags, "git_repo")}"
    managedBy   = "${lookup(local.tags, "managed_by")}"
  }
}

data "archive_file" "email_lambda" {
  type        = "zip"
  source_dir  = "${path.module}/email-forwarder"
  output_path = "email-forwarder.zip"
}

resource "aws_lambda_function" "email_lambda" {
  function_name = "email_lambda"
  filename      = "email-forwarder.zip"
  role          = aws_iam_role.email_lambda.arn

  handler = "email-forwarder"

  source_code_hash = data.archive_file.email_lambda.output_base64sha256
  runtime          = "go1.x"

  environment {
    variables = {
      MAIL_BUCKET              = aws_s3_bucket.email_bucket.bucket
      MAIL_CONFIGURATION_SET   = "${aws_ses_configuration_set.email_forward_lambda.name}"
      MAIL_FORWARD_BOUNCE_PATH = "${var.email.bounce}"

      MAIL_FORWARD_AS_NAME  = "${var.email.forwardAsName}"
      MAIL_FORWARD_AS_EMAIL = "${var.email.forwardAsEmail}"

      MAIL_FORWARD_TO_NAME  = "${var.email.forwardToName}"
      MAIL_FORWARD_TO_EMAIL = "${var.email.forwardToEmail}"
    }
  }

  tags = {
    application = "${lookup(local.tags, "application")}"
    environment = "${lookup(local.tags, "environment")}"
    gitRepo     = "${lookup(local.tags, "git_repo")}"
    managedBy   = "${lookup(local.tags, "managed_by")}"
  }
}

resource "aws_lambda_permission" "email_lambda" {
  statement_id   = "AllowExecutionFromSES"
  action         = "lambda:InvokeFunction"
  function_name  = aws_lambda_function.email_lambda.function_name
  principal      = "ses.amazonaws.com"
  source_account = data.aws_caller_identity.current.account_id
}

# Lambda Logs
resource "aws_iam_policy" "email_lambda_logs" {
  name = "email_lambda_logs"
  policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        Action : [
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ],
        Effect : "Allow",
        Resource : "arn:aws:logs:*:*:*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "email_lambda_logs_policy_attachment" {
  role       = aws_iam_role.email_lambda.id
  policy_arn = aws_iam_policy.email_lambda_logs.arn
}

resource "aws_cloudwatch_log_group" "lambda_log_group" {
  name              = "/aws/lambda/${aws_lambda_function.email_lambda.function_name}"
  retention_in_days = 7
  lifecycle {
    prevent_destroy = false
  }
}

###########
# Back up
resource "aws_ses_email_identity" "email_identity" {
  email = var.email.forwardToEmail
}

resource "aws_ses_template" "template" {
  name    = "Test"
  subject = "Test Email"
  html    = file("${path.module}/email_templates/test.html")
  text    = file("${path.module}/email_templates/test.txt")
}

resource "aws_ses_configuration_set" "test_set" {
  name = "test-configuration-set"
}

output "ses_configuration_set_name" {
  value = aws_ses_configuration_set.test_set.name
}
