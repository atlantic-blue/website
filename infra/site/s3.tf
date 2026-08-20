# Bucket holding the static assets and the prerendered cache.
resource "aws_s3_bucket" "assets" {
  bucket        = "${local.prefix}-assets"
  force_destroy = true
  tags          = local.tags
}

resource "aws_s3_bucket_public_access_block" "assets" {
  bucket                  = aws_s3_bucket.assets.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Only CloudFront, through Origin Access Control, may read the bucket. The old stack used
# the older Origin Access Identity.
data "aws_iam_policy_document" "assets" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.assets.arn}/*"]
    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }
    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.site.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "assets" {
  bucket = aws_s3_bucket.assets.id
  policy = data.aws_iam_policy_document.assets.json
}

# Upload the OpenNext output. The build must exist before apply; the pipeline runs
# `npm run build:opennext` first.
resource "null_resource" "upload" {
  triggers = {
    build_id = filemd5("${local.open_next_dir}/assets/BUILD_ID")
  }

  # No --delete on the assets. The hashed files under _next are immutable and must survive a
  # deploy, otherwise page markup still cached at CloudFront or in a browser points at a hash
  # a later deploy removed, and the page loads with no stylesheet and no script. Old assets
  # are small and harmless to keep.
  provisioner "local-exec" {
    command = <<-EOT
      aws s3 sync "${local.open_next_dir}/assets" "s3://${aws_s3_bucket.assets.id}/_assets"
      aws s3 sync "${local.open_next_dir}/cache" "s3://${aws_s3_bucket.assets.id}/_cache" --delete
    EOT
  }

  depends_on = [aws_s3_bucket.assets]
}

# Purge the cached markup after a deploy so it points at the new build's assets. The assets
# themselves are immutable, so only the markup matters.
resource "null_resource" "invalidate" {
  triggers = {
    build_id = filemd5("${local.open_next_dir}/assets/BUILD_ID")
  }

  provisioner "local-exec" {
    command = "aws cloudfront create-invalidation --distribution-id ${aws_cloudfront_distribution.site.id} --paths '/*'"
  }

  depends_on = [null_resource.upload, aws_cloudfront_distribution.site]
}
