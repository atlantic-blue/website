variable "stage" {
  description = "Deployment stage. 'production' takes the apex; anything else takes <stage>.atlanticblue.solutions."
  type        = string
  default     = "staging"
}

variable "root_domain" {
  type    = string
  default = "atlanticblue.solutions"
}

variable "search_console_token" {
  description = "The TXT value Google Search Console gives for the domain property. The zone publishes it, so it is not a secret."
  type        = string
  default     = "google-site-verification=JjU81S68bTtpRhN5k9Tul7L1L19hmhhJEkOH0lRqMs8"
}

variable "apex_txt_records" {
  description = "Every other TXT value the apex must carry, for example a sender policy."
  type        = list(string)
  default     = []
}
