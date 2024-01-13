data "aws_iam_policy_document" "terraform_user" {
  statement {
    actions = [
      "s3:*",
    ]

    resources = [
      "${aws_s3_bucket.terraform_bucket.arn}",
      "${aws_s3_bucket.terraform_bucket.arn}/*",
      "${aws_s3_bucket.www_bucket.arn}",
      "${aws_s3_bucket.www_bucket.arn}/*",
      "${aws_s3_bucket.email_bucket.arn}",
      "${aws_s3_bucket.email_bucket.arn}/*"
    ]
  }
}

resource "aws_iam_user" "terraform_user" {
  name = "terraform_user"

  tags = {
    application = "${lookup(local.tags, "application")}"
    environment = "${lookup(local.tags, "environment")}"
    gitRepo     = "${lookup(local.tags, "git_repo")}"
    managedBy   = "${lookup(local.tags, "managed_by")}"
  }
}

resource "aws_iam_user_policy" "terraform_user" {
  name   = aws_iam_user.terraform_user.name
  user   = aws_iam_user.terraform_user.name
  policy = data.aws_iam_policy_document.terraform_user.json
}

resource "aws_iam_access_key" "terraform_user" {
  user = aws_iam_user.terraform_user.name
}

output "terraform_user_access_key_id" {
  value = aws_iam_access_key.terraform_user.id
}

# terraform output terraform_user_secret_access_key
output "terraform_user_secret_access_key" {
  value     = aws_iam_access_key.terraform_user.secret
  sensitive = true
}
