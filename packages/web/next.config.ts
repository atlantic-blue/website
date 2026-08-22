import type { NextConfig } from "next"

const nextConfig: NextConfig = {
    // Trailing slashes make one page reachable at two addresses, which splits its
    // ranking. The old site had five language pages sharing one canonical link for
    // the same reason nobody checked. See docs/AUDIT-2026-08.md section 2.2.
    trailingSlash: false,
    poweredByHeader: false,
}

export default nextConfig
