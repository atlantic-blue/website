# Archive lambda function
data "archive_file" "www_lambda" {
  type        = "zip"
  # The output directory of the lambda
  source_dir  = "${path.cwd}/www-lambda/dist-server"
  output_path = "www_lambda.zip"
}

data "aws_iam_policy_document" "www_lambda" {
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

resource "aws_iam_role" "www_lambda" {
  name               = "www_lambda"
  assume_role_policy = data.aws_iam_policy_document.www_lambda.json

  tags = {
    application = "${lookup(local.tags, "application")}"
    environment = "${lookup(local.tags, "environment")}"
    gitRepo     = "${lookup(local.tags, "git_repo")}"
    managedBy   = "${lookup(local.tags, "managed_by")}"
  }
}

resource "aws_iam_policy" "www_lambda" {
  name = "www_lambda"
  policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        Action : [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
        ],
        Effect : "Allow",
        Resource : ["*"]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "www_lambda" {
  role       = aws_iam_role.www_lambda.id
  policy_arn = aws_iam_policy.www_lambda.arn
}

resource "aws_lambda_function" "www_lambda" {
  function_name = "www_lambda"
  filename      = "www_lambda.zip"
  role          = aws_iam_role.www_lambda.arn

  handler = "index.handler"
  runtime = "nodejs20.x"

  source_code_hash = data.archive_file.www_lambda.output_base64sha256

  environment {
    variables = {

    }
  }

  tags = {
    application = "${lookup(local.tags, "application")}"
    environment = "${lookup(local.tags, "environment")}"
    gitRepo     = "${lookup(local.tags, "git_repo")}"
    managedBy   = "${lookup(local.tags, "managed_by")}"
  }
}

# Lambda URL
resource "aws_lambda_function_url" "www_lambda" {
  function_name = aws_lambda_function.www_lambda.function_name
  # TODO add "IAM" for production
  authorization_type = "NONE"
}

output "www_lambda" {
  description = "www_lambda_url"
  value       = aws_lambda_function_url.www_lambda.function_url
}
