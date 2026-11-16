import { beforeAll, describe, expect, inject, it } from "vitest"

import { hushLogPrivacy, plainText } from "../src/lib/hushlog-privacy"
import { company } from "../src/lib/site"

const baseUrl = inject("baseUrl")
const path = "/hushlog/privacy"

/** What a reader sees, with a line break kept where the markup has one. */
const readableText = (markup: string): string =>
    markup
        .replace(/<br\s*\/?>/g, "\n")
        .replace(/<[^>]+>/g, "")
        .replace(/&#x27;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&")

// The App Store listing points at this address. Apple rejects a listing whose
// privacy policy link does not resolve.
describe("the HushLog privacy policy", () => {
    let status: number
    let body: string
    let text: string

    beforeAll(async () => {
        const response = await fetch(`${baseUrl}${path}`)
        status = response.status
        body = await response.text()
        text = readableText(body)
    })

    it("answers 200", () => {
        expect(status).toBe(200)
    })

    it("carries the main heading", () => {
        expect(body).toMatch(/<h1[^>]*>Privacy Policy<\/h1>/)
    })

    it("gives the page one h1 and a canonical pointing at itself", () => {
        expect((body.match(/<h1[\s>]/g) ?? []).length).toBe(1)
        expect(body).toContain(`rel="canonical" href="${company.origin}${path}"`)
    })

    it("titles and describes itself for a search engine", () => {
        expect(body).toContain("<title>HushLog Privacy Policy | Atlantic Blue</title>")
        expect(body).toMatch(/<meta name="description" content="How HushLog handles your data\./)
    })

    it("states the effective date and the last updated date", () => {
        expect(text).toContain("Effective date: 1 March 2026")
        expect(text).toContain("Last updated: 4 November 2026")
    })

    it("names the two companies that receive data", () => {
        expect(text).toContain(
            "Google, an advertising network. HushLog asks Google for one advertisement",
        )
        expect(text).toContain(
            "Meta, for measuring advertising campaigns. Meta's software runs in HushLog",
        )
    })

    it("says that no audio leaves the phone", () => {
        expect(text).toContain("HushLog sends no audio and no result anywhere.")
        expect(text).toContain("It is never transmitted off your device.")
    })

    it("gives an address to write to", () => {
        expect(body).toContain('href="mailto:support@atlanticblue.co.uk"')
        expect(text).toContain("Email: support@atlanticblue.co.uk")
    })

    // A heading that is missing, or a word dropped between a bold label and the
    // sentence after it, is the fault this catches. A bold label joined to the
    // next sentence with no space shipped once already.
    it("renders every part of the policy, word for word", () => {
        expect(hushLogPrivacy.parts.length).toBe(11)

        for (const part of hushLogPrivacy.parts) {
            for (const block of part.blocks) {
                const runs =
                    "paragraph" in block ? [block.paragraph] : block.list.map((item) => item)
                for (const run of runs) {
                    expect(text, `${part.heading}: missing text`).toContain(plainText(run))
                }
            }
        }
    })

    it("gives every part its own heading, in the order the policy publishes them", () => {
        const headings = [...body.matchAll(/<h2[^>]*>([^<]+)<\/h2>/g)].map((match) =>
            readableText(match[1]!),
        )
        expect(headings).toEqual(hushLogPrivacy.parts.map((part) => part.heading))
    })

    // A url rendered as plain text, or a typo in an href, is the fault here. The
    // addresses belong to Google and to Meta, so the test reads the markup rather
    // than the live sites.
    it("offers every address the policy names as a working link", () => {
        const hrefs = new Set(
            [...body.matchAll(/<a[^>]*href="([^"]+)"/g)].map((match) => match[1]!),
        )

        for (const href of [
            "https://developers.google.com/admob/ios/privacy/data-disclosure",
            "https://policies.google.com/technologies/partner-sites",
            "https://policies.google.com/privacy",
            "https://www.facebook.com/privacy/policy/",
            "mailto:support@atlanticblue.co.uk",
        ]) {
            expect(hrefs, `${href} is not a link`).toContain(href)
        }
    })
})
