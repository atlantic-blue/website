import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

import { describe, expect, inject, it } from "vitest"

// AdMob reads this file with a program. A changed space, a lost newline or a
// second line makes the record invalid. The test holds the full string, so a
// formatter cannot change it quietly.
const record = "google.com, pub-2410701279830883, DIRECT, f08c47fec0942fa0\n"

const filePath = fileURLToPath(new URL("../public/app-ads.txt", import.meta.url))
const baseUrl = inject("baseUrl")

describe("app-ads.txt", () => {
    it("holds the record and nothing else", () => {
        expect(readFileSync(filePath, "utf8")).toBe(record)
    })

    it("answers at the root of the site", async () => {
        const response = await fetch(`${baseUrl}/app-ads.txt`)
        expect(response.status).toBe(200)
        expect(await response.text()).toBe(record)
    })
})
