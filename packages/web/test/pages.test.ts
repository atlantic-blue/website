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
