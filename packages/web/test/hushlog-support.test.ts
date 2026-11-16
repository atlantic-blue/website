import { beforeAll, describe, expect, inject, it } from "vitest"

import { company } from "../src/lib/site"

const baseUrl = inject("baseUrl")
const path = "/hushlog/support"

const readableText = (markup: string): string =>
    markup
        .replace(/<[^>]+>/g, " ")
        .replace(/&#x27;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, "&")
        .replace(/\s+/g, " ")

// Apple requires a support address on an App Store listing. A reviewer opens
// this page, and so does a person who taps App Support on the product page.
describe("the HushLog support page", () => {
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
        expect(body).toMatch(/<h1[^>]*>HushLog Support<\/h1>/)
    })

    it("gives the page one h1 and a canonical pointing at itself", () => {
        expect((body.match(/<h1[\s>]/g) ?? []).length).toBe(1)
        expect(body).toContain(`rel="canonical" href="${company.origin}${path}"`)
    })

    it("titles and describes itself for a search engine", () => {
        expect(body).toContain("<title>HushLog Support | Atlantic Blue</title>")
        expect(body).toMatch(/<meta name="description" content="Help with HushLog, the snoring/)
    })

    it("says which product the page is for, and links to it", () => {
        expect(text).toContain("This page is for HushLog, the snoring recorder for iPhone")
        expect(body).toContain('href="https://atlanticblue.solutions/hushlog"')
    })

    it("offers the support address as a working link, and says we answer in English", () => {
        expect(body).toContain('href="mailto:support@atlanticblue.co.uk"')
        expect(text).toContain("support@atlanticblue.co.uk")
        expect(text).toContain("We answer in English")
    })

    it("links to the privacy policy", () => {
        expect(body).toContain('href="/hushlog/privacy"')
    })

    // The answers are the support contract. A question that loses its answer
    // sends the reader to the address above for something the page already
    // covers.
    it.each([
        ["Does it cost anything to record a night?", "Recording is free on every night."],
        [
            "Why do I see an advertisement?",
            "One payment in the app removes every advertisement on that phone, for good.",
        ],
        ["Where do my recordings go?", "The app sends no audio anywhere."],
        [
            "Does the app record when the screen is off?",
            "It also keeps recording when the phone is locked.",
        ],
        ["Where do I put the phone?", "within about a metre of your head"],
        [
            "Can HushLog tell me what is wrong with my sleep?",
            "HushLog is not a medical device and it diagnoses nothing.",
        ],
    ])("answers %s", (question, answer) => {
        expect(text).toContain(question)
        expect(text).toContain(answer)
    })
})
