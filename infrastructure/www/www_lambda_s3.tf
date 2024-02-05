# resource "aws_s3_bucket_ownership_controls" "www_lambda" {
#   bucket = aws_s3_bucket.www_lambda.id
#   rule {
#     object_ownership = "BucketOwnerPreferred"
#   }
# }

# resource "aws_s3_bucket_acl" "www_lambda" {
#   depends_on = [aws_s3_bucket_ownership_controls.www_lambda]

#   bucket = aws_s3_bucket.www_lambda.id
#   acl    = "private"
# }

# resource "aws_s3_bucket" "www_lambda" {
#   bucket = local.www_lambda_bucket_name
#   tags = {
#     application = "${lookup(local.tags, "application")}"
#     environment = "${lookup(local.tags, "environment")}"
#     gitRepo     = "${lookup(local.tags, "git_repo")}"
#     managedBy   = "${lookup(local.tags, "managed_by")}"
#   }
# }
