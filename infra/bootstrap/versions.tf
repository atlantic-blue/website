terraform {
  required_version = ">= 1.10"

  # Local state. This stack creates the bucket every other stack keeps its state in,
  # so it cannot keep its own state there. See README.md before deleting this directory.
  required_providers {
    aws = { source = "hashicorp/aws", version = ">= 5.0" }
  }
}

# us-east-1 keeps the state bucket with the CloudFront certificate region.
provider "aws" {
  region = "us-east-1"
}
