# Security response headers on every CloudFront response. The old site sent none at all:
# no strict transport security, no nosniff, no content security policy, and a minimum
# protocol of TLS 1.1. See docs/AUDIT-2026-08.md section 2.4.
#
# The site self hosts its fonts. The one third party is the Google tag, which loads
# only after the visitor accepts, so its hosts are named here and no other host is.
# Inline script and style are allowed because Next.js injects its own hydration script
# and the pages emit an inline structured data block.
locals {
  content_security_policy = join("; ", [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https://*.google-analytics.com https://www.googletagmanager.com",
    "font-src 'self'",
    "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ])
}

resource "aws_cloudfront_response_headers_policy" "security" {
  name = "${local.prefix}-security-headers"

  security_headers_config {
    strict_transport_security {
      access_control_max_age_sec = 63072000 # two years
      include_subdomains         = true
      preload                    = true
      override                   = true
    }
    content_type_options {
      override = true # X-Content-Type-Options: nosniff
    }
    frame_options {
      frame_option = "DENY"
      override     = true
    }
    referrer_policy {
      referrer_policy = "strict-origin-when-cross-origin"
      override        = true
    }
    content_security_policy {
      content_security_policy = local.content_security_policy
      override                = true
    }
  }

  # Permissions-Policy has no first class field, so lock the powerful features down here.
  custom_headers_config {
    items {
      header   = "Permissions-Policy"
      value    = "camera=(), microphone=(), geolocation=(), browsing-topics=()"
      override = true
    }
  }
}
