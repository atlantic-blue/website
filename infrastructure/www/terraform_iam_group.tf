resource "aws_iam_group" "developers" {
  name = "developers"
  path = "/developers/"
}

data "aws_iam_policy_document" "developers_policy_document" {
  statement {
    actions = [
      "acm:DescribeCertificate",
      "acm:Get*",
      "acm:List*",

      "cloudfront:Get*",
      "cloudfront:List*",
      "cloudfront:UpdateDistribution",

      "ses:Get*",
      "ses:List*",
      "ses:Describe*",

      "SNS:Get*",
      "SNS:List*",

      "iam:Get*",
      "iam:List*",

      "route53:Get*",
      "route53:List*",

      "lambda:Get*",
      "lambda:List*",
      "lambda:UpdateFunctionCode",

      "logs:Get*",
      "logs:List*",
      "logs:Describe*"
    ]

    resources = [
      "*",
    ]
  }
}

resource "aws_iam_policy" "developers_policy" {
  name   = "developers_policy"
  policy = data.aws_iam_policy_document.developers_policy_document.json
}

resource "aws_iam_group_policy_attachment" "developers_policy_attachment" {
  policy_arn = aws_iam_policy.developers_policy.arn
  group      = aws_iam_group.developers.name
}

data "aws_iam_policy_document" "developers_policy_s3_document" {
  statement {
    actions = [
      "s3:*",
    ]

    resources = [
      "${aws_s3_bucket.terraform_bucket.arn}",
      "${aws_s3_bucket.terraform_bucket.arn}/*",
      "${aws_s3_bucket.www_lambda.arn}",
      "${aws_s3_bucket.www_lambda.arn}/*",
      "${aws_s3_bucket.email_bucket.arn}",
      "${aws_s3_bucket.email_bucket.arn}/*"
    ]
  }
}

resource "aws_iam_policy" "developers_policy_s3" {
  name   = "developers_policy_s3"
  policy = data.aws_iam_policy_document.developers_policy_s3_document.json
}

resource "aws_iam_group_policy_attachment" "developers_policy_s3_attachment" {
  policy_arn = aws_iam_policy.developers_policy_s3.arn
  group      = aws_iam_group.developers.name
}

resource "aws_iam_group_membership" "terraform_membership" {
  name  = aws_iam_user.terraform_user.name
  users = [aws_iam_user.terraform_user.name]
  group = aws_iam_group.developers.name
}
