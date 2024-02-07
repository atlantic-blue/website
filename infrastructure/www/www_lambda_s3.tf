data "aws_iam_policy_document" "www_lambda_bucket" {
  statement {
    actions = [
      "s3:GetObject"
    ]
    resources = [
      "${aws_s3_bucket.www_lambda.arn}/*"
    ]
    principals {
      type = "AWS"
      identifiers = [
        "${aws_cloudfront_origin_access_identity.www_lambda.iam_arn}"
      ]
    }
  }
}

resource "aws_s3_bucket_policy" "www_lambda" {
  bucket = aws_s3_bucket.www_lambda.id
  policy = data.aws_iam_policy_document.www_lambda_bucket.json
}

resource "aws_s3_bucket_ownership_controls" "www_lambda" {
  bucket = aws_s3_bucket.www_lambda.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_acl" "www_lambda" {
  depends_on = [aws_s3_bucket_ownership_controls.www_lambda]

  bucket = aws_s3_bucket.www_lambda.id
  acl    = "private"
}

resource "aws_s3_bucket" "www_lambda" {
  bucket = local.www_lambda_bucket_name
  tags = {
    application = "${lookup(local.tags, "application")}"
    environment = "${lookup(local.tags, "environment")}"
    gitRepo     = "${lookup(local.tags, "git_repo")}"
    managedBy   = "${lookup(local.tags, "managed_by")}"
  }
}

output "www_lambda_bucket" {
  value = aws_s3_bucket.www_lambda.id
}
