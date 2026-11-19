import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

import { beforeAll, describe, expect, inject, it } from "vitest"

import { services } from "../src/lib/services"
import { company } from "../src/lib/site"
import { engagements } from "../src/lib/work"

const baseUrl = inject("baseUrl")

const cloudfrontFile = fileURLToPath(new URL("../../../infra/site/cloudfront.tf", import.meta.url))

/** The address a crawler reads, which is the live site, never the test server. */
const addressOf = (path: string): string =>
    path === "/" ? company.origin : `${company.origin}${path}`

const pathOf = (address: string): string => address.slice(company.origin.length) || "/"

interface Entry {
    readonly address: string
    readonly lastModified: string | undefined
}

const entriesOf = (xml: string): Entry[] =>
    [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((block) => ({
        address: block[1]?.match(/<loc>([^<]*)<\/loc>/)?.[1] ?? "",
        lastModified: block[1]?.match(/<lastmod>([^<]*)<\/lastmod>/)?.[1],
    }))

const bucketPatterns = (): string[] => {
    const terraform = readFileSync(cloudfrontFile, "utf8")
    const list = terraform.match(/s3_patterns\s*=\s*\[([^\]]*)\]/)?.[1]
    if (list === undefined) {
        throw new Error(`no s3_patterns list in ${cloudfrontFile}`)
    }
    return [...list.matchAll(/"([^"]*)"/g)]
        .map((match) => match[1])
        .filter((pattern): pattern is string => pattern !== undefined)
}

const matches = (pattern: string, path: string): boolean =>
    new RegExp(`^${pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*")}$`).test(path)

// Every public page of the site. The service and the work addresses come from
// the two lists, so a service added later reaches the sitemap on its own.
const expectedPaths = [
    "/",
    "/services",
    "/work",
    ...services.map((service) => `/services/${service.slug}`),
    ...engagements.map((engagement) => `/work/${engagement.slug}`),
    "/hushlog",
    "/hushlog/privacy",
    "/hushlog/support",
    "/privacy",
]

// Each of these is built by another step. A page that exists must be in the
// sitemap, and an address in the sitemap must answer 200. The two checks
// together hold whichever way round the steps merge.
const pagesFromOtherSteps = ["/contact", "/cookies"]

const statusOf = async (path: string): Promise<number> => (await fetch(`${baseUrl}${path}`)).status

describe("the sitemap lists every page", () => {
    let response: Response
    let entries: Entry[]
    let addresses: string[]

    beforeAll(async () => {
        response = await fetch(`${baseUrl}/sitemap.xml`)
        entries = entriesOf(await response.text())
        addresses = entries.map((entry) => entry.address)
    })

    // Both lists are read from a file. An empty one makes every check below
    // iterate nothing, and a loop over nothing reports a pass.
    it("checks a list of pages that was actually read", () => {
        expect(services.length).toBeGreaterThan(5)
        expect(engagements.length).toBeGreaterThan(5)
        expect(expectedPaths.length).toBeGreaterThan(15)
        expect(new Set(expectedPaths).size).toBe(expectedPaths.length)
    })

    it("answers 200 as xml", () => {
        expect(response.status).toBe(200)
        expect(response.headers.get("content-type")).toMatch(/^application\/xml/)
    })

    it.each(expectedPaths)("holds %s", (path) => {
        expect(addresses).toContain(addressOf(path))
    })

    it("holds no address twice", () => {
        expect(new Set(addresses).size).toBe(addresses.length)
    })

    it("gives every address in full, on the live origin", () => {
        expect(addresses.length).toBeGreaterThan(15)
        for (const address of addresses) {
            expect(address.startsWith(`${company.origin}/`) || address === company.origin).toBe(
                true,
            )
        }
    })

    // A listed address that answers 404 costs indexing, the same as a page that
    // is missing from the list.
    it("lists no address the site does not serve", async () => {
        for (const address of addresses) {
            expect(await statusOf(pathOf(address)), `${address} does not answer 200`).toBe(200)
        }
    })

    it.each(pagesFromOtherSteps)("lists %s only once the page exists", async (path) => {
        const exists = (await statusOf(path)) === 200
        expect(addresses.includes(addressOf(path))).toBe(exists)
    })

    it("dates every address, and dates none of them in the future", () => {
        for (const entry of entries) {
            expect(entry.lastModified, `${entry.address} carries no date`).toBeDefined()
            const date = new Date(entry.lastModified!)
            expect(date.getTime(), `${entry.address} has an unreadable date`).not.toBeNaN()
            expect(date.getTime(), `${entry.address} is dated in the future`).toBeLessThanOrEqual(
                Date.now(),
            )
        }
    })
})

describe("the robots file", () => {
    let response: Response
    let body: string

    beforeAll(async () => {
        response = await fetch(`${baseUrl}/robots.txt`)
        body = await response.text()
    })

    it("answers 200 as plain text", () => {
        expect(response.status).toBe(200)
        expect(response.headers.get("content-type")).toMatch(/^text\/plain/)
    })

    it("lets every crawler read every page", () => {
        expect(body).toMatch(/User-?[Aa]gent:\s*\*/)
        expect(body).toMatch(/Allow:\s*\/\s*$/m)
        expect(body).not.toMatch(/Disallow:\s*\/\s*$/m)
    })

    it("names the sitemap", () => {
        expect(body).toContain(`Sitemap: ${company.origin}/sitemap.xml`)
    })
})

// A pattern here sends the path to the bucket, where the key does not exist, so
// Origin Access Control answers 403. A 403 on robots.txt stops every crawler.
describe("CloudFront", () => {
    const patterns = bucketPatterns()

    it("reads the patterns it checks", () => {
        expect(patterns.length).toBeGreaterThan(0)
    })

    it.each(["robots.txt", "sitemap.xml"])("sends %s to the server function", (path) => {
        for (const pattern of patterns) {
            expect(matches(pattern, path), `${pattern} sends ${path} to the bucket`).toBe(false)
        }
    })
})
