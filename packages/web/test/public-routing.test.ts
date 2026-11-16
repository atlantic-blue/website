import { readdirSync, readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

import { describe, expect, it } from "vitest"

// No test that drives the application can see this fault. `next start` serves
// public/ itself, so the file always answers 200 here. In production CloudFront
// decides, and it sends every path it has no pattern for to the server function,
// which answers 404. The two lists must agree, so read both and compare them.
const publicDir = fileURLToPath(new URL("../public", import.meta.url))
const cloudfrontFile = fileURLToPath(new URL("../../../infra/site/cloudfront.tf", import.meta.url))

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

const patterns = bucketPatterns()
const entries = readdirSync(publicDir, { withFileTypes: true })

describe("every entry the site publishes", () => {
    // Both lists are read from disk. An empty one makes the checks below iterate
    // nothing, and a loop over nothing reports a pass.
    it("is checked against a list that was actually read", () => {
        expect(patterns.length).toBeGreaterThan(0)
        expect(entries.length).toBeGreaterThan(0)
    })

    for (const entry of entries) {
        const pattern = entry.isDirectory() ? `${entry.name}/*` : entry.name

        it(`routes ${entry.name} to the bucket, with the pattern ${pattern}`, () => {
            expect(patterns).toContain(pattern)
        })
    }
})
