resource "aws_cloudfront_origin_access_identity" "www_lambda" {
  comment = "access_identity_${local.www_lambda_bucket_name}"
}


resource "aws_cloudfront_distribution" "www_lambda" {
  # Point to S3 BUCKET
  origin {
    domain_name = aws_s3_bucket.www_lambda.bucket_regional_domain_name
    origin_id   = local.www_lambda_s3_origin_id

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.www_lambda.cloudfront_access_identity_path
    }
  }

  origin {
    # This is required because "domain_name" needs to be in a specific format
    domain_name = replace(replace(aws_lambda_function_url.www_lambda.function_url, "https://", ""), "/", "")
    origin_id   = aws_lambda_function.www_lambda.function_name

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = aws_lambda_function.www_lambda.function_name

    forwarded_values {
      query_string = true

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 0
    max_ttl                = 0
    compress               = true
  }

  ordered_cache_behavior {
    path_pattern     = "/assets/*"
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = local.www_lambda_s3_origin_id
    forwarded_values {
      query_string = false
      headers      = ["Origin"]

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 0
    max_ttl                = 0
    compress               = true
  }

  ordered_cache_behavior {
    path_pattern     = "*.js*"
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = local.www_lambda_s3_origin_id
    forwarded_values {
      query_string = false
      headers      = ["Origin"]

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 0
    max_ttl                = 0
    compress               = true
  }

  ordered_cache_behavior {
    path_pattern     = "*.css*"
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = local.www_lambda_s3_origin_id
    forwarded_values {
      query_string = false
      headers      = ["Origin"]

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 0
    max_ttl                = 0
    compress               = true
  }

  custom_error_response {
    error_code         = "404"
    response_code      = "200"
    response_page_path = "/index.html"
  }

  custom_error_response {
    error_code         = "403"
    response_code      = "200"
    response_page_path = "/index.html"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  comment             = "www_lambda CDN"
  default_root_object = "index.html"

  tags = {
    application = "${lookup(local.tags, "application")}"
    environment = "${lookup(local.tags, "environment")}"
    gitRepo     = "${lookup(local.tags, "git_repo")}"
    managedBy   = "${lookup(local.tags, "managed_by")}"
  }

  #   aliases = [
  #     var.domain_name
  #   ]

  viewer_certificate {
    cloudfront_default_certificate = true
    # cloudfront_default_certificate = false
    # ssl_support_method             = "sni-only"
    # minimum_protocol_version       = "TLSv1.1_2016"
    # acm_certificate_arn            = aws_acm_certificate.www_certificate.arn
  }
}

output "aws_cloudfront_distribution_www_lambda" {
  value = "https://${aws_cloudfront_distribution.www_lambda.domain_name}"
}
