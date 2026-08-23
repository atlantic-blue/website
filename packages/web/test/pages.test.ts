import { beforeAll, describe, expect, inject, it } from "vitest"

import { services } from "../src/lib/services"
import { engagements } from "../src/lib/work"
import { company } from "../src/lib/site"

const baseUrl = inject("baseUrl")

const get = async (path: string) => {
    const response = await fetch(`${baseUrl}${path}`)
    return { status: response.status, body: await response.text() }
}

const countOf = (markup: string, pattern: RegExp): number => (markup.match(pattern) ?? []).length

describe("the home page", () => {
    let status: number
    let body: string

    beforeAll(async () => {
        ;({ status, body } = await get("/"))
    })

    it("answers 200", () => {
        expect(status).toBe(200)
    })

    it("carries exactly one h1", () => {
        expect(countOf(body, /<h1[\s>]/g)).toBe(1)
    })

    it("points its canonical link at itself", () => {
        expect(body).toContain(`rel="canonical" href="${company.origin}"`)
    })

    it("offers a skip link before the content", () => {
        expect(body.indexOf('href="#main"')).toBeLessThan(body.indexOf('id="main"'))
    })

    it("shows the company number and the registered office, as the law requires", () => {
        expect(body).toContain(company.companyNumber)
        expect(body).toContain("86-90 Paul Street")
    })

    it("gives the visitor a way to make contact", () => {
        expect(body).toContain(`mailto:${company.email}`)
    })
})

describe("an address that does not exist", () => {
    // The old site answered 200 with the home page for every one of these.
    // See docs/AUDIT-2026-08.md section 2.2.
    const missing = ["/nonsense-xyz", "/blog", "/contact", "/about"]

    it.each(missing)("answers 404 for %s", async (path) => {
        const { status } = await get(path)
        expect(status).toBe(404)
    })

    it("serves the not found page, not the home page", async () => {
        const { body } = await get("/nonsense-xyz")
        expect(body).toMatch(/<h1[^>]*>Page not found<\/h1>/)
        // The footer now carries the tagline on every page, so check the heading.
        expect(body).not.toMatch(/<h1[^>]*>We build software/)
    })

    // A canonical link set on the layout is inherited by every page beneath it.
    // That is how the old site ended up with five language pages all declaring
    // the home page as their canonical. See docs/AUDIT-2026-08.md section 2.2.
    it("claims no canonical of its own", async () => {
        const { body } = await get("/nonsense-xyz")
        expect(body).not.toContain('rel="canonical"')
    })

    it("tells search engines not to index it", async () => {
        const { body } = await get("/nonsense-xyz")
        expect(body).toMatch(/name="robots"[^>]*content="[^"]*noindex/)
    })
})

describe("the server", () => {
    it("does not announce what it runs on", async () => {
        const response = await fetch(baseUrl)
        expect(response.headers.get("x-powered-by")).toBeNull()
    })
})

describe("the design system", () => {
    let body: string

    beforeAll(async () => {
        ;({ body } = await get("/"))
    })

    it("self hosts its faces, so nothing loads from another origin", () => {
        expect(body).not.toMatch(/fonts\.googleapis\.com|fonts\.gstatic\.com|cdn\./)
    })

    // Not loading a font from elsewhere is half the check. The other half is that
    // ours actually resolve. They 404ed in production because CloudFront had no
    // route for /fonts and sent the request to the server function.
    it("serves every face it asks for", async () => {
        const stylesheet = body.match(/href="(\/_next\/static\/[^"]+\.css)"/)?.[1]
        expect(stylesheet).toBeDefined()

        const css = await (await fetch(`${baseUrl}${stylesheet}`)).text()
        const faces = [...css.matchAll(/url\((\/fonts\/[^)]+\.woff2)\)/g)].map((m) => m[1])
        expect(faces.length).toBeGreaterThan(0)

        for (const face of faces) {
            const response = await fetch(`${baseUrl}${face}`)
            expect(response.status, `${face} did not resolve`).toBe(200)
        }
    })

    it("names the clients we are allowed to name", () => {
        for (const name of ["ITV", "Sky", "DAZN", "castLabs"]) {
            expect(body).toContain(name)
        }
    })

    // Naming a client is agreed. Anything specific about their systems is not.
    // See DESIGN.md, "Confidentiality".
    it("carries no client attributed metric", () => {
        expect(body).not.toMatch(/300\s?KB|1\s?MB|World Cup|TheoPlayer|XLink|interstitial/i)
    })
})

describe("the service pages", () => {
    const slugs = services.map((service) => service.slug)

    it("has one page per service, and there is more than one", () => {
        expect(slugs.length).toBeGreaterThan(5)
        expect(new Set(slugs).size).toBe(slugs.length)
    })

    it.each(slugs)("answers 200 for /services/%s", async (slug) => {
        const { status } = await get(`/services/${slug}`)
        expect(status).toBe(200)
    })

    it("gives each page one h1 and a canonical pointing at itself", async () => {
        for (const slug of slugs) {
            const { body } = await get(`/services/${slug}`)
            expect(countOf(body, /<h1[\s>]/g), `${slug} h1 count`).toBe(1)
            expect(body, `${slug} canonical`).toContain(
                `rel="canonical" href="${company.origin}/services/${slug}"`,
            )
        }
    })

    it("carries Service structured data a search engine can read", async () => {
        const { body } = await get(`/services/${slugs[0]}`)
        const block = body.match(/application\/ld\+json[^>]*>([\s\S]*?)<\/script>/)?.[1]
        expect(block).toBeDefined()

        const parsed = JSON.parse(block!.replace(/&quot;/g, '"'))
        const types = parsed["@graph"].map((node: { "@type": string }) => node["@type"])
        expect(types).toContain("Service")
        expect(types).toContain("BreadcrumbList")
    })

    it("lists every service on the index", async () => {
        const { body } = await get("/services")
        for (const service of services) {
            expect(body, `${service.name} missing from the index`).toContain(service.name)
        }
    })

    // Naming a client is agreed. Anything specific about their systems is not.
    it("carries no client attributed metric on any page", async () => {
        for (const slug of ["", "services", ...slugs.map((s) => `services/${s}`)]) {
            const { body } = await get(`/${slug}`)
            expect(body, `leak on /${slug}`).not.toMatch(
                /300\s?KB|1\s?MB|World Cup|TheoPlayer|XLink|interstitial/i,
            )
        }
    })
})

describe("mobile layout", () => {
    // The header needed about 438px before this: a wordmark, two text links and
    // a button, all unconditional. The narrowest phone in common use is 320.
    // Two links were hidden below 640px and nothing replaced them, so a phone had
    // no navigation at all. Whatever is in the header has to be reachable.
    it("keeps the navigation visible at every width", async () => {
        const { body } = await get("/")
        const header = body.match(/<header[\s\S]*?<\/header>/)?.[0] ?? ""
        expect(header).toContain(">Services<")
        expect(header).not.toMatch(/class="[^"]*\bhidden\b[^"]*"[^>]*>Services</)
    })

    it("keeps the call to action visible at every width", async () => {
        const { body } = await get("/")
        const header = body.match(/<header[\s\S]*?<\/header>/)?.[0] ?? ""
        expect(header).toContain("Book a call")
        expect(header).not.toMatch(/class="[^"]*hidden[^"]*"[^>]*>Book a call</)
    })

    // Overriding --spacing scales every utility on every element at once.
    it("does not redefine the Tailwind spacing unit", async () => {
        const stylesheet = (await get("/")).body.match(/href="(\/_next\/static\/[^"]+\.css)"/)?.[1]
        const css = await (await fetch(`${baseUrl}${stylesheet}`)).text()
        expect(css).not.toMatch(/--spacing:\s*8px/)
    })

    it("has breakpoints beyond the single one it shipped with", async () => {
        const stylesheet = (await get("/")).body.match(/href="(\/_next\/static\/[^"]+\.css)"/)?.[1]
        const css = await (await fetch(`${baseUrl}${stylesheet}`)).text()
        const widths = new Set([...css.matchAll(/min-width:\s*([\d.]+rem)/g)].map((m) => m[1]))
        expect(widths.size).toBeGreaterThan(2)
    })
})

describe("finding the pages", () => {
    // A heading that is a link has to look like one. Every service title was set
    // in the body colour with no underline, so the eight pages behind them were
    // invisible even though the links were there.
    it("marks a service link as a link", async () => {
        const { body } = await get("/")
        const anchors = [...body.matchAll(/<a[^>]*href="\/services\/[^"]+"[^>]*>/g)].map(
            (m) => m[0],
        )
        expect(anchors.length).toBeGreaterThan(5)
        for (const anchor of anchors) {
            expect(anchor, `no visual affordance: ${anchor}`).toMatch(/underline|text-accent/)
        }
    })

    it("reaches every service page from the footer of every page", async () => {
        for (const path of ["/", "/services", `/services/${services[0]!.slug}`]) {
            const { body } = await get(path)
            const footer = body.match(/<footer[\s\S]*?<\/footer>/)?.[0] ?? ""
            for (const service of services) {
                expect(footer, `${service.slug} missing from the footer on ${path}`).toContain(
                    `/services/${service.slug}`,
                )
            }
        }
    })

    it("only offers a header link once the page behind it exists", async () => {
        const { body } = await get("/")
        const header = body.match(/<header[\s\S]*?<\/header>/)?.[0] ?? ""
        for (const [label, href] of [
            ["Services", "/services"],
            ["Work", "/work"],
        ] as const) {
            expect(header, `${label} missing`).toContain(`>${label}<`)
            expect((await get(href)).status, `${href} does not exist`).toBe(200)
        }
    })
})

describe("the work pages", () => {
    const slugs = engagements.map((engagement) => engagement.slug)

    it.each(slugs)("answers 200 for /work/%s", async (slug) => {
        const { status } = await get(`/work/${slug}`)
        expect(status).toBe(200)
    })

    it("gives each page one h1 and a canonical pointing at itself", async () => {
        for (const slug of slugs) {
            const { body } = await get(`/work/${slug}`)
            expect(countOf(body, /<h1[\s>]/g), `${slug} h1 count`).toBe(1)
            expect(body, `${slug} canonical`).toContain(
                `rel="canonical" href="${company.origin}/work/${slug}"`,
            )
        }
    })

    it("names the client and links to the services the work touches", async () => {
        for (const engagement of engagements) {
            const { body } = await get(`/work/${engagement.slug}`)
            expect(body, `${engagement.slug} client`).toContain(engagement.client)
            for (const service of engagement.services) {
                expect(body, `${engagement.slug} -> ${service}`).toContain(`/services/${service}`)
            }
        }
    })

    it("carries Article structured data", async () => {
        const { body } = await get(`/work/${slugs[0]}`)
        const block = body.match(/application\/ld\+json[^>]*>([\s\S]*?)<\/script>/)?.[1]
        const parsed = JSON.parse(block!.replace(/&quot;/g, '"'))
        const types = parsed["@graph"].map((node: { "@type": string }) => node["@type"])
        expect(types).toContain("Article")
        expect(types).toContain("BreadcrumbList")
    })

    // The whole point of these pages is that they name a client without publishing
    // anything that belongs to the client. See DESIGN.md, "Confidentiality".
    it("names a client on every page and a client metric on none", async () => {
        for (const slug of slugs) {
            const { body } = await get(`/work/${slug}`)
            expect(body, `leak on /work/${slug}`).not.toMatch(
                /300\s?KB|1\s?MB|World Cup|TheoPlayer|XLink|interstitial|Shaka|exoPlayer|hasplayer/i,
            )
        }
    })

    it("reaches every engagement from the footer", async () => {
        const { body } = await get("/")
        const footer = body.match(/<footer[\s\S]*?<\/footer>/)?.[0] ?? ""
        for (const engagement of engagements) {
            expect(footer, `${engagement.slug} missing from the footer`).toContain(
                `/work/${engagement.slug}`,
            )
        }
    })
})
