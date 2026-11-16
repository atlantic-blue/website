import { beforeAll, describe, expect, inject, it } from "vitest"

import { privacy, plainText } from "../src/lib/privacy"
import { company } from "../src/lib/site"

const baseUrl = inject("baseUrl")
const path = "/privacy"

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

// A visitor hands us a name, an email address and a message. This page is the
// only place that tells them who holds it, who else sees it, how long it stays,
// and how to complain. A missing processor or a wrong retention period is a
// failure of the law, and the visitor cannot use a right they cannot find.
describe("the privacy policy names the processors and the retention", () => {
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

    it("gives the page one h1 and a canonical pointing at itself", () => {
        expect(body).toMatch(/<h1[^>]*>Privacy Policy<\/h1>/)
        expect((body.match(/<h1[\s>]/g) ?? []).length).toBe(1)
        expect(body).toContain(`rel="canonical" href="${company.origin}${path}"`)
    })

    it("titles and describes itself for a search engine", () => {
        expect(body).toContain("<title>Privacy Policy | Atlantic Blue</title>")
        expect(body).toMatch(/<meta name="description" content="[^"]+"/)
    })

    it("says when it was last updated", () => {
        expect(text).toContain(`Last updated: ${privacy.lastUpdated}`)
        expect(privacy.lastUpdated).not.toBe("")
    })

    it("names the company that answers for the data", () => {
        expect(text).toContain(company.legalName)
        expect(text).toContain(company.companyNumber)
        expect(text).toContain("86-90 Paul Street")
        expect(body).toContain(`href="mailto:${company.email}"`)
    })

    it("says what the contact form collects", () => {
        for (const field of [
            "your name",
            "your email address",
            "your company",
            "your message",
            "the page you sent it from",
        ]) {
            expect(text, `${field} is not named`).toContain(field)
        }
    })

    it("says that the visitor address itself is never stored", () => {
        expect(text).toContain("We do not store the address itself.")
    })

    it("says that an enquiry is deleted after 24 months", () => {
        expect(text).toContain("24 months")
    })

    it("names Amazon Web Services and what it does", () => {
        expect(text).toContain("Amazon Web Services")
        expect(text).toContain("Amazon Simple Email Service")
        expect(text).toContain("DynamoDB")
    })

    it("names Google Analytics and says it runs only after consent", () => {
        expect(text).toContain("Google Analytics 4")
        expect(text).toMatch(/Google Analytics 4[\s\S]{0,400}only after you accept/)
    })

    it("says where the data is held and what covers the transfer", () => {
        expect(text).toContain("United States")
        expect(text).toContain("standard contractual clauses")
        expect(text).toContain("International Data Transfer Addendum")
    })

    it("lists the rights of the visitor and how to use them", () => {
        for (const right of [
            "access",
            "correction",
            "deletion",
            "restriction",
            "objection",
            "portability",
        ]) {
            expect(text, `the right of ${right} is not named`).toContain(right)
        }
        expect(text).toContain(`write to ${company.email}`)
    })

    it("gives the Information Commissioner's Office as the place to complain", () => {
        expect(text).toContain("Information Commissioner's Office")
        expect(body).toContain('href="https://ico.org.uk"')
    })

    // The heading list is written out here rather than read from the policy,
    // because a section deleted from the data would delete itself from the
    // comparison too and the check would still pass.
    it("carries every section, in this order", () => {
        const headings = [...body.matchAll(/<h2[^>]*>([^<]+)<\/h2>/g)].map((match) =>
            readableText(match[1]!),
        )
        expect(headings).toEqual([
            "Who we are",
            "What this policy covers",
            "What we collect",
            "Why we hold it",
            "How long we keep it",
            "Who else handles it",
            "Where your data is held",
            "Analytics",
            "Your rights",
            "How to complain",
            "Changes to this policy",
        ])
        expect(privacy.parts.map((part) => part.heading)).toEqual(headings)
    })

    // A bold label joined to the sentence after it with no space shipped once
    // already on the other policy page. Read every run of words back.
    it("renders every paragraph of the policy, word for word", () => {
        expect(privacy.parts.length).toBe(11)

        for (const part of privacy.parts) {
            expect(part.blocks.length, `${part.heading}: no text`).toBeGreaterThan(0)
            for (const block of part.blocks) {
                const runs =
                    "paragraph" in block ? [block.paragraph] : block.list.map((item) => item)
                for (const run of runs) {
                    expect(text, `${part.heading}: missing text`).toContain(plainText(run))
                }
            }
        }
    })
})

describe("the footer offers the privacy policy from every page", () => {
    it.each(["/", "/services", "/work", path])("is reachable from %s", async (from) => {
        const response = await fetch(`${baseUrl}${from}`)
        expect(response.status).toBe(200)
        expect(await response.text()).toContain(`href="${path}"`)
    })
})
