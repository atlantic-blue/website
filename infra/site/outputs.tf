output "url" {
  value = "https://${local.primary_domain}"
}

output "cloudfront_domain" {
  value = aws_cloudfront_distribution.site.domain_name
}

output "distribution_id" {
  value = aws_cloudfront_distribution.site.id
}

output "assets_bucket" {
  value = aws_s3_bucket.assets.id
}
