data "archive_file" "server" {
  type        = "zip"
  source_dir  = "${local.open_next_dir}/server-functions/default"
  output_path = "${path.module}/.build/server.zip"
}

data "archive_file" "image" {
  type        = "zip"
  source_dir  = "${local.open_next_dir}/image-optimization-function"
  output_path = "${path.module}/.build/image.zip"
}

data "aws_caller_identity" "current" {}

data "aws_iam_policy_document" "lambda_assume" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "lambda" {
  name               = "${local.prefix}-lambda"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json
  tags               = local.tags
}

data "aws_iam_policy_document" "lambda" {
  statement {
    effect    = "Allow"
    actions   = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"]
    resources = ["arn:aws:logs:*:*:*"]
  }

  # The image function reads the source images from this stack's bucket.
  statement {
    effect    = "Allow"
    actions   = ["s3:GetObject", "s3:PutObject", "s3:ListBucket", "s3:DeleteObject"]
    resources = [aws_s3_bucket.assets.arn, "${aws_s3_bucket.assets.arn}/*"]
  }
}

resource "aws_iam_role_policy" "lambda" {
  role   = aws_iam_role.lambda.id
  policy = data.aws_iam_policy_document.lambda.json
}

# The image function answers a public function url, so the enquiry tables and the mail
# identity stay out of its reach: the server function runs as a role of its own.
resource "aws_iam_role" "server" {
  name               = "${local.prefix}-server"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json
  tags               = local.tags
}

data "aws_iam_policy_document" "server" {
  statement {
    effect    = "Allow"
    actions   = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"]
    resources = ["arn:aws:logs:*:*:*"]
  }

  # The server function reads and writes the incremental cache in this stack's bucket.
  statement {
    effect    = "Allow"
    actions   = ["s3:GetObject", "s3:PutObject", "s3:ListBucket", "s3:DeleteObject"]
    resources = [aws_s3_bucket.assets.arn, "${aws_s3_bucket.assets.arn}/*"]
  }

  statement {
    effect    = "Allow"
    actions   = ["dynamodb:PutItem", "dynamodb:UpdateItem"]
    resources = [aws_dynamodb_table.enquiries.arn, aws_dynamodb_table.rate_limits.arn]
  }

  statement {
    effect    = "Allow"
    actions   = ["ses:SendEmail"]
    resources = ["arn:aws:ses:us-east-1:${data.aws_caller_identity.current.account_id}:identity/${var.root_domain}"]
  }
}

resource "aws_iam_role_policy" "server" {
  role   = aws_iam_role.server.id
  policy = data.aws_iam_policy_document.server.json
}

resource "aws_lambda_function" "server" {
  function_name    = "${local.prefix}-server"
  role             = aws_iam_role.server.arn
  filename         = data.archive_file.server.output_path
  source_code_hash = data.archive_file.server.output_base64sha256
  handler          = "index.handler"
  runtime          = "nodejs22.x"
  memory_size      = 1024
  timeout          = 30
  tags             = local.tags

  environment {
    variables = {
      CACHE_BUCKET_NAME       = aws_s3_bucket.assets.id
      CACHE_BUCKET_KEY_PREFIX = "_cache"
      CACHE_BUCKET_REGION     = "us-east-1"
      BUCKET_KEY_PREFIX       = "_assets"
      NEXT_PUBLIC_SITE_ORIGIN = "https://${local.primary_domain}"
      ENQUIRIES_TABLE         = aws_dynamodb_table.enquiries.name
      RATE_LIMITS_TABLE       = aws_dynamodb_table.rate_limits.name
      CONTACT_MAIL_ADDRESS    = "hello@atlanticblue.solutions"
    }
  }
}

resource "aws_lambda_function" "image" {
  function_name    = "${local.prefix}-image"
  role             = aws_iam_role.lambda.arn
  filename         = data.archive_file.image.output_path
  source_code_hash = data.archive_file.image.output_base64sha256
  handler          = "index.handler"
  runtime          = "nodejs22.x"
  memory_size      = 1536
  timeout          = 30
  tags             = local.tags

  environment {
    variables = {
      BUCKET_NAME       = aws_s3_bucket.assets.id
      BUCKET_KEY_PREFIX = "_assets"
    }
  }
}

# A public function URL needs both permissions to work: one for the URL, one for the function
# behind it. Miss the second and every request returns 403.
#
# Only the InvokeFunctionUrl permission takes function_url_auth_type. Putting it on the
# InvokeFunction permission fails the apply with
# "FunctionUrlAuthType is only supported for lambda:InvokeFunctionUrl action".
resource "aws_lambda_function_url" "server" {
  function_name      = aws_lambda_function.server.function_name
  authorization_type = "NONE"
}

resource "aws_lambda_function_url" "image" {
  function_name      = aws_lambda_function.image.function_name
  authorization_type = "NONE"
}

resource "aws_lambda_permission" "server_url" {
  statement_id           = "AllowFunctionUrl"
  action                 = "lambda:InvokeFunctionUrl"
  function_name          = aws_lambda_function.server.function_name
  principal              = "*"
  function_url_auth_type = "NONE"
}

resource "aws_lambda_permission" "server_invoke" {
  statement_id  = "AllowInvokeViaFunctionUrl"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.server.function_name
  principal     = "*"
}

resource "aws_lambda_permission" "image_url" {
  statement_id           = "AllowFunctionUrl"
  action                 = "lambda:InvokeFunctionUrl"
  function_name          = aws_lambda_function.image.function_name
  principal              = "*"
  function_url_auth_type = "NONE"
}

resource "aws_lambda_permission" "image_invoke" {
  statement_id  = "AllowInvokeViaFunctionUrl"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.image.function_name
  principal     = "*"
}
