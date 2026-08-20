import { describe, expect, it } from "vitest"

import { canonicalPath, canonicalUrl } from "../src/canonical"

describe("canonicalPath", () => {
    it("maps the root file to the root", () => {
        expect(canonicalPath("/index.html")).toBe("/")
        expect(canonicalPath("/")).toBe("/")
    })

    it("drops the file extension the build adds", () => {
        expect(canonicalPath("/about.html")).toBe("/about")
        expect(canonicalPath("/services/live-event-readiness.html")).toBe(
            "/services/live-event-readiness",
        )
    })

    it("drops a trailing slash, because the site declares it uses none", () => {
        expect(canonicalPath("/about/")).toBe("/about")
        expect(canonicalPath("/work/itv/index.html")).toBe("/work/itv")
    })

    it("leaves an address that is already correct alone", () => {
        expect(canonicalPath("/work/sky")).toBe("/work/sky")
    })
})

describe("canonicalUrl", () => {
    it("builds an absolute address on the live origin", () => {
        expect(canonicalUrl("/index.html")).toBe("https://atlanticblue.solutions/")
        expect(canonicalUrl("/about.html")).toBe("https://atlanticblue.solutions/about")
    })
})
