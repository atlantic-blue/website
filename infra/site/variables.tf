variable "stage" {
  description = "Deployment stage. 'production' takes the apex; anything else takes <stage>.atlanticblue.solutions."
  type        = string
  default     = "staging"
}

variable "root_domain" {
  type    = string
  default = "atlanticblue.solutions"
}
