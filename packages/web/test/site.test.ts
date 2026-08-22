import { describe, expect, it } from "vitest"

import { company } from "../src/lib/site"

describe("company", () => {
    it("holds the registered number from Companies House", () => {
        expect(company.companyNumber).toBe("14468993")
    })

    it("uses an origin without a trailing slash, so addresses join cleanly", () => {
        expect(company.origin.endsWith("/")).toBe(false)
    })
})
