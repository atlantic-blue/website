# infra/site

Terraform for the website: the OpenNext build of the Next.js application, deployed as S3 for the
assets and the cache, a server function, an image function, CloudFront, a certificate and DNS.

- State: `s3://atlantic-blue-website-tfstate/atlanticblue.solutions/site.tfstate`, with native
  locking.
- Stages: `-var stage=tf|staging|production`. Production takes the apex and `www`. Any other stage
  takes `<stage>.atlanticblue.solutions`.

## Deploy

The build output must exist before apply. The pipeline does this in order:

```bash
cd packages/web
npm ci
npm run build:opennext        # writes packages/web/.open-next
cd ../../infra/site
terraform init
terraform apply -var stage=tf # tf.atlanticblue.solutions, a safe target
```

## Taking over the apex

Production is the target and there is no staged subdomain step. The site has no traffic to lose
yet, and giving it some is the point of the rebuild.

One thing still has to happen first, and it is an API refusal rather than caution. The old stack in
`infrastructure/www` owns the live distribution, and that distribution claims
`atlanticblue.solutions` as an alias. CloudFront does not allow two distributions to claim the
same alias, so `terraform apply -var stage=production` fails with
`CNAMEAlreadyExists` until the alias is released.

Release it by removing the `aliases` block from the old distribution and applying that stack, or by
retiring the old stack altogether. Issue #21 covers the retirement, and it must leave the email
forwarder alone, because that is in use.

The alias records here use `allow_overwrite`, so they adopt the apex as soon as the alias is free.

## Why the asset sync has no --delete

The hashed files under `_next/static` are immutable and must survive a deploy. Page markup still
cached at CloudFront or in a browser points at a hash from the previous build, and deleting it
serves that visitor a page with no stylesheet and no script. Old assets are small and harmless to
keep.

## Function URL access

Both functions sit behind public function URLs, reached through CloudFront. A public function URL
needs two permissions to work, `lambda:InvokeFunctionUrl` and `lambda:InvokeFunction`. Both are in
`lambda.tf`. Scoping the second one, or moving to Origin Access Control, is worth doing later.
