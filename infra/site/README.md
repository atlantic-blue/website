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

## Read this before pointing production at it

The old stack in `infrastructure/www` still owns the live distribution, and that distribution
claims `atlanticblue.solutions` as an alias. CloudFront refuses to let two distributions claim the
same alias, so `terraform apply -var stage=production` fails until the alias is removed from the
old distribution.

The order that works:

1. Apply this stack with a stage subdomain. Check the site on it.
2. Remove the alias from the old distribution, in `infrastructure/www`.
3. Apply this stack with `stage=production`. The alias records use `allow_overwrite`, so they adopt
   the apex.
4. Only then retire the old stack. Issue #21 covers that, and it must leave the email forwarder
   alone, because that is in use.

## Why the asset sync has no --delete

The hashed files under `_next/static` are immutable and must survive a deploy. Page markup still
cached at CloudFront or in a browser points at a hash from the previous build, and deleting it
serves that visitor a page with no stylesheet and no script. Old assets are small and harmless to
keep.

## Function URL access

Both functions sit behind public function URLs, reached through CloudFront. A public function URL
needs two permissions to work, `lambda:InvokeFunctionUrl` and `lambda:InvokeFunction`. Both are in
`lambda.tf`. Scoping the second one, or moving to Origin Access Control, is worth doing later.
