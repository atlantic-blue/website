output "deploy_role_arn" {
  description = "Set this as the AWS_DEPLOY_ROLE_ARN repository secret."
  value       = aws_iam_role.deploy.arn
}

output "state_bucket" {
  description = "The bucket the site stack keeps its state in."
  value       = aws_s3_bucket.state.id
}
