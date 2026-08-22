// OpenNext build config.
//
// The site has no on-demand revalidation, so the revalidation queue and the DynamoDB tag cache
// are disabled. Prerendered pages still serve from the S3 incremental cache. That keeps the
// deployment to S3, a server function, an image function and CloudFront, which is what
// infra/site provisions.
const config = {
    default: {
        override: {
            queue: "dummy",
            tagCache: "dummy",
        },
    },
}

export default config
