import type { MetadataRoute } from "next"

import { services } from "@/lib/services"
import { company } from "@/lib/site"
import { engagements } from "@/lib/work"

/**
 * One date for the whole site. No page and no entry in the two lists carries a
 * date of its own, and a build timestamp would tell a crawler that all of these
 * pages changed on every deploy, which is false.
 */
const lastModified = new Date("2026-11-16T00:00:00Z")

/**
 * Every public page. The service and the work addresses are read from the two
 * lists, so a service added later reaches the sitemap without an edit here.
 *
 * /contact, /privacy and /cookies are absent because the pages do not exist yet.
 * The step that builds each one adds its address.
 */
const paths: readonly string[] = [
    "/",
    "/services",
    "/work",
    ...services.map((service) => `/services/${service.slug}`),
    ...engagements.map((engagement) => `/work/${engagement.slug}`),
    "/hushlog",
    "/hushlog/privacy",
    "/hushlog/support",
]

const sitemap = (): MetadataRoute.Sitemap =>
    paths.map((path) => ({
        url: path === "/" ? company.origin : `${company.origin}${path}`,
        lastModified,
    }))

export default sitemap
