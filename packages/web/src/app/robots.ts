import type { MetadataRoute } from "next"

import { company } from "@/lib/site"

const robots = (): MetadataRoute.Robots => ({
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${company.origin}/sitemap.xml`,
})

export default robots
