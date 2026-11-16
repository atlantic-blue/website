/**
 * A client writes its own X-Forwarded-For, so the leftmost entry is a value the
 * sender chooses and a bot changes on every request. CloudFront appends the
 * address it saw to the end of that header, and it sends the same address as
 * CloudFront-Viewer-Address when the origin request policy asks for it. The
 * policy on this distribution, Managed-AllViewerExceptHostHeader, does not ask
 * for it yet, so the last entry is what the live stack reads.
 */
export const viewerAddress = (headers: Headers): string => {
    const seen = headers.get("cloudfront-viewer-address")?.trim() ?? ""
    if (seen !== "") {
        return withoutPort(seen)
    }

    const entries = (headers.get("x-forwarded-for") ?? "")
        .split(",")
        .map((entry) => entry.trim())
        .filter((entry) => entry !== "")
    return entries[entries.length - 1] ?? "unknown"
}

/** CloudFront-Viewer-Address ends with the port, after the last colon, in both families. */
const withoutPort = (address: string): string => {
    const lastColon = address.lastIndexOf(":")
    return lastColon === -1 ? address : address.slice(0, lastColon)
}
