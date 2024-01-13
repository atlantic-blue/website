terraform {
  required_version = ">= v1.3.1"

  backend "s3" {
    bucket  = "abs-terraform"
    key     = "abs-website"
    region  = "us-east-1"
    encrypt = true
    profile = "atlantic-blue-infra"
  }
}
