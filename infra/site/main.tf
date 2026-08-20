locals {
  is_production = var.stage == "production"
  prefix        = "abs-${var.stage}"

  # production -> apex (and www); any other stage -> <stage>.atlanticblue.solutions
  domain_names   = local.is_production ? [var.root_domain, "www.${var.root_domain}"] : ["${var.stage}.${var.root_domain}"]
  primary_domain = local.domain_names[0]

  open_next_dir = "${path.module}/../../packages/web/.open-next"

  tags = {
    application = "atlanticblue-solutions"
    environment = var.stage
    gitRepo     = "atlantic-blue/website"
    managedBy   = "terraform"
  }
}

data "aws_route53_zone" "primary" {
  name         = "${var.root_domain}."
  private_zone = false
}
