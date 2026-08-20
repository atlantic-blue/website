import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

import { company } from "../src/site"

const dist = fileURLToPath(new URL("../dist/", import.meta.url))
const home = readFileSync(`${dist}index.html`, "utf8")

const countOf = (markup: string, pattern: RegExp): number => (markup.match(pattern) ?? []).length

describe("the built home page", () => {
    it("carries exactly one h1", () => {
        expect(countOf(home, /<h1[\s>]/g)).toBe(1)
    })

    it("points its canonical link at itself, not at the origin root", () => {
        expect(home).toContain(`<link rel="canonical" href="${company.origin}/">`)
    })

    it("carries a description", () => {
        expect(home).toMatch(/<meta name="description" content="[^"]{50,}"/)
    })

    it("offers a skip link before the content", () => {
        expect(home.indexOf('href="#main"')).toBeGreaterThan(-1)
        expect(home.indexOf('href="#main"')).toBeLessThan(home.indexOf('id="main"'))
    })

    it("shows the company number and the registered office, as the law requires", () => {
        expect(home).toContain(company.companyNumber)
        expect(home).toContain("86-90 Paul Street")
    })

    it("ships no render blocking script, because the page needs none", () => {
        expect(countOf(home, /<script(?![^>]*type="application\/ld\+json")/g)).toBe(0)
    })
})

describe("the footer", () => {
    it("puts a space between the label and the address", () => {
        expect(home).toContain("Registered office: 86-90 Paul Street")
    })
})
