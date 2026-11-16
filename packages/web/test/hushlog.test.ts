import { beforeAll, describe, expect, inject, it } from "vitest"

import { company } from "../src/lib/site"

const baseUrl = inject("baseUrl")
const path = "/hushlog"

const readableText = (markup: string): string =>
    markup
        .replace(/<[^>]+>/g, " ")
        .replace(/&#x27;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, "&")
        .replace(/\s+/g, " ")

// The App Store listing names this address as the Marketing URL, and Google
// reads the hostname of it to find app-ads.txt at the site root.
describe("the HushLog product page", () => {
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

    it("names the product in its only h1", () => {
        expect(body).toMatch(/<h1[^>]*>HushLog<\/h1>/)
        expect((body.match(/<h1[\s>]/g) ?? []).length).toBe(1)
    })

    it("says in one line what the app is", () => {
        expect(text).toContain("A snoring recorder for iPhone. It records every night for nothing.")
    })

    it("titles and describes itself for a search engine", () => {
        expect(body).toContain("<title>HushLog | Atlantic Blue</title>")
        expect(body).toMatch(/<meta name="description" content="HushLog is a snoring recorder/)
        expect(body).toContain(`rel="canonical" href="${company.origin}${path}"`)
    })

    // The listing, the policy and the support page are the three addresses a
    // reader of the App Store page needs. A typo in one of them is the fault here.
    it("offers all three addresses as links", () => {
        const hrefs = new Set(
            [...body.matchAll(/<a[^>]*href="([^"]+)"/g)].map((match) => match[1]!),
        )

        for (const href of [
            "https://apps.apple.com/gb/app/hush-log-snoring-recorder/id6759836267",
            "/hushlog/privacy",
            "/hushlog/support",
        ]) {
            expect(hrefs, `${href} is not a link`).toContain(href)
        }
    })

    it("states what a person gets", () => {
        for (const point of [
            "A snore score from 0 to 100 for the night.",
            "A timeline of the whole night.",
            "The loudest moments, ready to play.",
            "Tags for the remedies and the factors you try.",
            "An export of your own data, as a file you keep.",
        ]) {
            expect(text, `missing: ${point}`).toContain(point)
        }
    })

    it("states what it costs, and that nothing recurs", () => {
        for (const point of [
            "Recording is free on every night.",
            "One short advertisement opens a night's report.",
            "One payment removes every advertisement for good.",
            "There is no subscription.",
        ]) {
            expect(text, `missing: ${point}`).toContain(point)
        }
    })

    it("states where the recordings stay", () => {
        for (const point of [
            "Your recordings stay on your phone.",
            "The app sends no audio anywhere.",
            "There is no account and no sign in.",
        ]) {
            expect(text, `missing: ${point}`).toContain(point)
        }
    })

    // HushLog is not a medical device and it diagnoses nothing. The site chrome
    // carries words such as secure, so this reads the page body only.
    it("makes no medical claim", () => {
        const main = readableText(body.match(/<main[\s\S]*?<\/main>/)?.[0] ?? "")
        expect(main.length).toBeGreaterThan(400)
        expect(main).not.toMatch(
            /\b(diagnos\w*|apnoea|apnea|treats?|cures?|medical|doctor|clinical)\b/i,
        )
    })
})
