resource "aws_iam_user" "www_user" {
  name = "www_user"

  tags = {
    application = "${lookup(local.tags, "application")}"
    environment = "${lookup(local.tags, "environment")}"
    gitRepo     = "${lookup(local.tags, "git_repo")}"
    managedBy   = "${lookup(local.tags, "managed_by")}"
  }
}

resource "aws_iam_user_policy" "www_user" {
  name   = aws_iam_user.www_user.name
  user   = aws_iam_user.www_user.name
  policy = data.aws_iam_policy_document.www_user.json
}

data "aws_iam_policy_document" "www_user" {
  statement {
    actions = [
      "s3:*",
    ]

    resources = [
      "${aws_s3_bucket.www_bucket.arn}",
      "${aws_s3_bucket.www_bucket.arn}/*"
    ]
  }
}

resource "aws_iam_access_key" "www_user" {
  user = aws_iam_user.www_user.name
}

output "www_access_key_id" {
  value = aws_iam_access_key.www_user.id
}

# terraform output www_secret_access_key
output "www_secret_access_key" {
  value     = aws_iam_access_key.www_user.secret
  sensitive = true
}
