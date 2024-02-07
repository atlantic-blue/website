data "aws_iam_policy_document" "www_bucket_policy_document" {
  statement {
    actions = [
      "s3:GetObject"
    ]
    resources = [
      "${aws_s3_bucket.www_bucket.arn}/*"
    ]
    principals {
      type = "AWS"
      identifiers = [
        "${aws_cloudfront_origin_access_identity.www_access_identity.iam_arn}"
      ]
    }
  }
}

resource "aws_s3_bucket_policy" "www_bucket_policy" {
  bucket = aws_s3_bucket.www_bucket.id
  policy = data.aws_iam_policy_document.www_bucket_policy_document.json
}

resource "aws_s3_bucket_ownership_controls" "www_bucket_ownreship" {
  bucket = aws_s3_bucket.www_bucket.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_acl" "www_bucket_acl" {
  depends_on = [aws_s3_bucket_ownership_controls.www_bucket_ownreship]

  bucket = aws_s3_bucket.www_bucket.id
  acl    = "private"
}

resource "aws_s3_bucket" "www_bucket" {
  bucket = local.www_bucket_name
  tags = {
    application = "${lookup(local.tags, "application")}"
    environment = "${lookup(local.tags, "environment")}"
    gitRepo     = "${lookup(local.tags, "git_repo")}"
    managedBy   = "${lookup(local.tags, "managed_by")}"
  }
}

output "www_bucket" {
  value = aws_s3_bucket.www_bucket.id
}
