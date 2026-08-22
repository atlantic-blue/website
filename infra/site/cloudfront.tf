locals {
  server_origin_id = "server"
  image_origin_id  = "image"
  s3_origin_id     = "s3"

  server_host = trimsuffix(trimprefix(aws_lambda_function_url.server.function_url, "https://"), "/")
  image_host  = trimsuffix(trimprefix(aws_lambda_function_url.image.function_url, "https://"), "/")

  # AWS managed policies
  cache_optimized_id            = "658327ea-f89d-4fab-a63d-7e88639e58f6" # CachingOptimized
  orp_all_viewer_except_host_id = "b689b0a8-53d0-40ab-baf2-68738e2966ac" # AllViewerExceptHostHeader

  # Paths served straight from the bucket rather than from the server function.
  #
  # Everything under the app's public/ directory lands at the root of the OpenNext assets
  # output, so each such directory needs a pattern here or CloudFront sends the request to
  # the server function, which has no route for it and answers 404.
  #
  # robots.txt and sitemap.xml are deliberately absent: they are served by the application
  # (issue #9), not from the bucket. Routing them here returns 403, because Origin Access
  # Control refuses a key that does not exist, and a 403 on robots.txt is worse than a 404.
  s3_patterns = ["BUILD_ID", "_next/static/*", "fonts/*", "favicon.ico"]
}

resource "aws_cloudfront_origin_access_control" "s3" {
  name                              = "${local.prefix}-s3"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# Dynamic responses: vary the cache key on the query string, but honour the Cache-Control the
# origin sends. The old distribution set every time to live to zero, so nothing cached at all
# and every request woke the function. See docs/AUDIT-2026-08.md section 2.3.
resource "aws_cloudfront_cache_policy" "dynamic" {
  name        = "${local.prefix}-dynamic"
  min_ttl     = 0
  default_ttl = 0
  max_ttl     = 31536000

  parameters_in_cache_key_and_forwarded_to_origin {
    enable_accept_encoding_brotli = true
    enable_accept_encoding_gzip   = true
    cookies_config { cookie_behavior = "none" }
    headers_config { header_behavior = "none" }
    query_strings_config { query_string_behavior = "all" }
  }
}

resource "aws_cloudfront_distribution" "site" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "atlanticblue.solutions (${var.stage})"
  default_root_object = ""
  aliases             = local.domain_names
  price_class         = "PriceClass_100"
  tags                = local.tags

  origin {
    origin_id                = local.s3_origin_id
    domain_name              = aws_s3_bucket.assets.bucket_regional_domain_name
    origin_path              = "/_assets"
    origin_access_control_id = aws_cloudfront_origin_access_control.s3.id
  }

  origin {
    origin_id   = local.server_origin_id
    domain_name = local.server_host
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  origin {
    origin_id   = local.image_origin_id
    domain_name = local.image_host
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # Anything not matched below is a page, and pages come from the server function.
  default_cache_behavior {
    target_origin_id           = local.server_origin_id
    viewer_protocol_policy     = "redirect-to-https"
    allowed_methods            = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods             = ["GET", "HEAD"]
    compress                   = true
    cache_policy_id            = aws_cloudfront_cache_policy.dynamic.id
    origin_request_policy_id   = local.orp_all_viewer_except_host_id
    response_headers_policy_id = aws_cloudfront_response_headers_policy.security.id
  }

  ordered_cache_behavior {
    path_pattern               = "_next/image*"
    target_origin_id           = local.image_origin_id
    viewer_protocol_policy     = "redirect-to-https"
    allowed_methods            = ["GET", "HEAD", "OPTIONS"]
    cached_methods             = ["GET", "HEAD"]
    compress                   = true
    cache_policy_id            = aws_cloudfront_cache_policy.dynamic.id
    origin_request_policy_id   = local.orp_all_viewer_except_host_id
    response_headers_policy_id = aws_cloudfront_response_headers_policy.security.id
  }

  dynamic "ordered_cache_behavior" {
    for_each = toset(local.s3_patterns)
    content {
      path_pattern               = ordered_cache_behavior.value
      target_origin_id           = local.s3_origin_id
      viewer_protocol_policy     = "redirect-to-https"
      allowed_methods            = ["GET", "HEAD"]
      cached_methods             = ["GET", "HEAD"]
      compress                   = true
      cache_policy_id            = local.cache_optimized_id
      response_headers_policy_id = aws_cloudfront_response_headers_policy.security.id
    }
  }

  restrictions {
    geo_restriction { restriction_type = "none" }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.site.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
}
