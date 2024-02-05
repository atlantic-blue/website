locals {
  tags = {
    git_repo    = "atlantic-blue/website"
    application = "atlanticblue-solutions"
    environment = var.environment
    managed_by  = "terraform"
  }

  www_lambda_bucket_name = "atlantic-blue-website-lambda"
  www_bucket_name        = "atlantic-blue-website"
  s3_origin_id           = "s3-${local.www_bucket_name}-${var.environment}"
}
