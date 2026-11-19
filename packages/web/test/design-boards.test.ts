import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

import { describe, expect, it } from "vitest"

interface Board {
    readonly file: string
    readonly screen: string
    readonly states: readonly string[]
}

// The states come from the path, not from the markup. A board that quietly loses
// the state nobody remembers to draw fails here instead of in the build step.
const boards: readonly Board[] = [
    {
        file: "contact.html",
        screen: "the contact page",
        states: ["empty", "field-errors", "sending", "sent", "rate-limited", "server-error"],
    },
    { file: "consent-banner.html", screen: "the consent banner", states: ["open"] },
    { file: "policy-page.html", screen: "a policy page", states: ["policy"] },
]

const designDir = fileURLToPath(new URL("../../../docs/design/", import.meta.url))

const read = (file: string): string => {
    try {
        return readFileSync(`${designDir}${file}`, "utf8")
    } catch {
        throw new Error(`there is no design board at docs/design/${file}`)
    }
}

const attributesThatLoad =
    /<(?:link|script|img|source|iframe|embed|object|video|audio|track)\b[^>]*>/gi
const addressInAttribute = /\b(?:src|srcset|href)\s*=\s*"([^"]*)"/gi
const addressInStyle = /(?:@import\s+|url\(\s*)["']?([^"')\s]+)/gi

const addressesThatLoad = (markup: string): string[] => {
    const found: string[] = []
    for (const tag of markup.match(attributesThatLoad) ?? []) {
        for (const match of tag.matchAll(addressInAttribute)) {
            found.push(
                ...(match[1] ?? "").split(",").map((part) => part.trim().split(/\s+/)[0] ?? ""),
            )
        }
    }
    for (const match of markup.matchAll(addressInStyle)) {
        found.push(match[1] ?? "")
    }
    return found.filter((address) => address !== "")
}

const isAnotherHost = (address: string): boolean => {
    if (address.startsWith("//")) {
        return true
    }
    const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(address)?.[1]?.toLowerCase()
    return scheme !== undefined && scheme !== "data"
}

describe("every new screen has a design board", () => {
    // Both loops below read these lists. An empty list makes each loop iterate
    // nothing, and a loop over nothing reports a pass.
    it("names a screen to check", () => {
        expect(boards.length).toBeGreaterThan(0)
        for (const board of boards) {
            expect(board.states.length).toBeGreaterThan(0)
        }
    })

    for (const board of boards) {
        describe(board.screen, () => {
            it("has a board the operator can open", () => {
                expect(read(board.file).length).toBeGreaterThan(0)
            })

            for (const state of board.states) {
                it(`shows what the visitor sees in the ${state} state`, () => {
                    expect(read(board.file)).toContain(`data-state="${state}"`)
                })
            }

            it("shows the screen on a phone and on a desktop", () => {
                const markup = read(board.file)
                expect(markup).toContain('data-width="390"')
                expect(markup).toContain('data-width="1440"')
            })

            it("shows the screen in the dark theme and in the light theme", () => {
                const markup = read(board.file)
                expect(markup).toContain('data-theme="dark"')
                expect(markup).toContain('data-theme="light"')
            })

            // The site loads nothing from another host, which is what keeps the
            // content security policy closed. A board that reaches a font service
            // draws a screen the site cannot build.
            it("loads nothing from another host", () => {
                const addresses = addressesThatLoad(read(board.file))
                expect(addresses.filter(isAnotherHost)).toEqual([])
            })
        })
    }
})
