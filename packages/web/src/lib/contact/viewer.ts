/**
 * The origin request policy on this distribution, Managed-AllViewerExceptHostHeader,
 * forwards every viewer header and asks CloudFront for none of its own. So a client
 * writes X-Forwarded-For and CloudFront-Viewer-Address as freely as it writes any
 * other header, and the one value it cannot choose is the entry CloudFront appends
 * to X-Forwarded-For, which is the address CloudFront saw. That entry is the last
 * one, and it is what the rate limit counts.
 */
export const viewerAddress = (headers: Headers): string => {
    const entries = (headers.get("x-forwarded-for") ?? "")
        .split(",")
        .map((entry) => entry.trim())
        .filter((entry) => entry !== "")
    return entries[entries.length - 1] ?? "unknown"
}
