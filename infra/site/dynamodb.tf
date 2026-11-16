resource "aws_dynamodb_table" "enquiries" {
  name         = "${local.prefix}-enquiries"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"
  tags         = local.tags

  attribute {
    name = "id"
    type = "S"
  }

  ttl {
    attribute_name = "expiresAt"
    enabled        = true
  }

  point_in_time_recovery {
    enabled = true
  }
}

# A counter lives for at most two hours and holds no address, only a hash of one, so this
# table needs no point in time recovery.
resource "aws_dynamodb_table" "rate_limits" {
  name         = "${local.prefix}-rate-limits"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "key"
  tags         = local.tags

  attribute {
    name = "key"
    type = "S"
  }

  ttl {
    attribute_name = "expiresAt"
    enabled        = true
  }
}
