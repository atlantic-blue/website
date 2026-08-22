# infra/bootstrap

The credentials the pipeline needs, and the bucket every other stack keeps its state in. This is
the one piece the pipeline cannot create for itself, so it is applied once by hand and managed in
code afterwards.

It creates a GitHub Actions OpenID Connect provider, the `atlantic-blue-website-deploy` role that
only this repository may assume, and the state bucket with versioning and encryption.

## State lives here, in this directory

The state is local, because this stack creates the bucket the other stacks store their state in.

**Do not delete this directory.** If the state is lost, the next apply tries to create a role and a
bucket that already exist and fails. Recover with import blocks:

```hcl
import {
  to = aws_iam_openid_connect_provider.github
  id = "arn:aws:iam::<account>:oidc-provider/token.actions.githubusercontent.com"
}

import {
  to = aws_iam_role.deploy
  id = "atlantic-blue-website-deploy"
}

import {
  to = aws_s3_bucket.state
  id = "atlantic-blue-website-tfstate"
}
```

## First run

Run once with administrator credentials for the account that holds the site:

```bash
cd infra/bootstrap
terraform init
terraform apply
```

Then set the `deploy_role_arn` output as the `AWS_DEPLOY_ROLE_ARN` repository secret.

## After the first run

The role can manage this stack, including itself, so later changes go through the pipeline. Open a
pull request, which runs `plan`, then run the **Infra (Terraform)** workflow by hand with
`action=apply`.

## If the role refuses the assume

Read the actual subject claim from CloudTrail rather than guessing at the trust pattern. The claim
can carry numeric identifiers rather than the plain repository name, and no pattern written against
the name matches that.

## Delete these afterwards

The repository still holds access keys created in 2023 and 2024:
`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `TERRAFORM_AWS_ACCESS_KEY_ID` and
`TERRAFORM_AWS_SECRET_ACCESS_KEY`. Once the deploy role works, delete the repository secrets **and**
delete the keys themselves in Identity and Access Management. Removing the secret alone leaves a
live key in the account.
