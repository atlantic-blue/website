variable "aws_region" {
  default     = "us-east-1"
  description = "Virginia"
}

variable "aws_profile" {
  default     = "atlantic-blue"
  description = "NA"
}

variable "environment" {
  default = "production"
}

variable "domain_name" {
  default = "atlanticblue.solutions"
}

variable "email" {
  type = object({
    name           = string
    bounce         = string
    forwardAsName  = string
    forwardAsEmail = string
    forwardToName  = string
    forwardToEmail = string
  })

  default = {
    name   = "atlanticbluesolutionslimited"
    bounce = "noreply@atlanticblue.solutions"

    forwardAsName  = "Atlantic Blue Solutions"
    forwardAsEmail = "hello@atlanticblue.solutions"

    forwardToName  = "Atlantic Blue Solutions"
    forwardToEmail = "atlanticbluesolutionslimited@gmail.com"
  }
}
