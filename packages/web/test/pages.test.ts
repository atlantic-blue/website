import { beforeAll, describe, expect, inject, it } from "vitest"

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
    const missing = ["/nonsense-xyz", "/blog", "/services", "/contact", "/about"]

    it.each(missing)("answers 404 for %s", async (path) => {
        const { status } = await get(path)
        expect(status).toBe(404)
    })

    it("serves the not found page, not the home page", async () => {
        const { body } = await get("/nonsense-xyz")
        expect(body).toContain("<h1>Page not found</h1>")
        expect(body).not.toContain(`<h1>${company.tradingName}</h1>`)
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
