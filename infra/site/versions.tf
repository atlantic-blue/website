terraform {
  required_version = ">= 1.10"

  backend "s3" {
    bucket       = "atlantic-blue-website-tfstate"
    key          = "atlanticblue.solutions/site.tfstate"
    region       = "us-east-1"
    encrypt      = true
    use_lockfile = true
  }

  required_providers {
    aws  = { source = "hashicorp/aws", version = ">= 5.0" }
    null = { source = "hashicorp/null", version = ">= 3.2" }
  }
}

# us-east-1 keeps the functions with the CloudFront certificate region.
provider "aws" {
  region = "us-east-1"
}
