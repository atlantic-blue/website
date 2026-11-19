// The banner decides in the browser, so this file runs in jsdom. The pages are
// still read from the running server, as the rest of the suite does.
// @vitest-environment jsdom

import { createElement } from "react"

import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeAll, beforeEach, describe, expect, inject, it } from "vitest"

import { ConsentBanner, CookieSettings } from "../src/components/consent-banner"
import {
    consentCookieName,
    consentCookieValue,
    consentFromCookies,
    readConsent,
} from "../src/lib/consent"
import { company } from "../src/lib/site"

const baseUrl = inject("baseUrl")
const path = "/cookies"

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

const forgetTheAnswer = (): void => {
    document.cookie = `${consentCookieName}=; Max-Age=0; Path=/`
}

const banner = () => screen.queryByRole("region", { name: /cookies/i })

const theVisitorLoadsAPage = (): void => {
    render(createElement("div", null, createElement(ConsentBanner), createElement(CookieSettings)))
}

// United Kingdom law needs consent before a cookie that is not strictly
// necessary, and Google Analytics sets such cookies. So the visitor decides
// before anything counts them, the answer lasts, and the visitor can change it.
// A banner that forgets a refusal breaks the law and asks the same person the
// same question on every page.
describe("a visitor accepts or rejects analytics and can change it", () => {
    beforeEach(forgetTheAnswer)
    afterEach(cleanup)

    it("asks a visitor who has not answered yet", () => {
        theVisitorLoadsAPage()

        expect(banner()).not.toBeNull()
        expect(screen.getByRole("button", { name: "Accept" })).toBeDefined()
        expect(screen.getByRole("button", { name: "Reject" })).toBeDefined()
    })

    it("sends the visitor to the cookie policy before they answer", () => {
        theVisitorLoadsAPage()

        expect(screen.getByRole("link", { name: /cookie policy/i }).getAttribute("href")).toBe(path)
    })

    // A refusal that is harder to give than an acceptance is a dark pattern, and
    // the regulator reads it as no consent at all.
    it("gives the two answers the same weight", () => {
        theVisitorLoadsAPage()

        const accept = screen.getByRole("button", { name: "Accept" })
        const reject = screen.getByRole("button", { name: "Reject" })
        expect(accept.className).toBe(reject.className)
        expect(accept.tagName).toBe(reject.tagName)
    })

    it("keeps a refusal and stops asking, even after a reload", () => {
        theVisitorLoadsAPage()
        fireEvent.click(screen.getByRole("button", { name: "Reject" }))

        expect(readConsent()).toBe("denied")
        expect(banner()).toBeNull()

        cleanup()
        theVisitorLoadsAPage()
        expect(banner()).toBeNull()
    })

    it("keeps an acceptance and stops asking, even after a reload", () => {
        theVisitorLoadsAPage()
        fireEvent.click(screen.getByRole("button", { name: "Accept" }))

        expect(readConsent()).toBe("granted")
        expect(banner()).toBeNull()

        cleanup()
        theVisitorLoadsAPage()
        expect(banner()).toBeNull()
    })

    it("asks again when the visitor opens the cookie settings, and takes the new answer", () => {
        theVisitorLoadsAPage()
        fireEvent.click(screen.getByRole("button", { name: "Reject" }))
        cleanup()

        theVisitorLoadsAPage()
        expect(banner()).toBeNull()

        fireEvent.click(screen.getByRole("button", { name: /cookie settings/i }))
        expect(banner()).not.toBeNull()

        fireEvent.click(screen.getByRole("button", { name: "Accept" }))
        expect(readConsent()).toBe("granted")
        expect(banner()).toBeNull()
    })

    it("keeps the answer for 12 months, for this site, and sends it nowhere else", () => {
        const value = consentCookieValue("granted", "https:")

        expect(value.startsWith(`${consentCookieName}=granted;`)).toBe(true)
        expect(value).toContain("Max-Age=31536000")
        expect(value).toContain("Path=/")
        expect(value).toContain("SameSite=Lax")
        expect(value).toContain("Secure")
    })

    // A browser drops a Secure cookie on http, so the answer would be forgotten
    // on every development server and in this suite.
    it("writes the answer on http too", () => {
        const value = consentCookieValue("denied", "http:")

        expect(value.startsWith(`${consentCookieName}=denied;`)).toBe(true)
        expect(value).not.toContain("Secure")
    })

    it("finds the answer among the other cookies of the site", () => {
        expect(consentFromCookies(`first=1; ${consentCookieName}=denied; last=2`)).toBe("denied")
        expect(consentFromCookies(`${consentCookieName}=granted`)).toBe("granted")
    })

    // An unreadable answer must mean "not answered". Anything else reads a
    // damaged cookie as permission to count the visitor.
    it("treats a missing or damaged answer as no answer", () => {
        expect(consentFromCookies("first=1; last=2")).toBeNull()
        expect(consentFromCookies(`${consentCookieName}=maybe`)).toBeNull()
        expect(consentFromCookies("")).toBeNull()
    })
})

describe("the cookie policy", () => {
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
        expect(body).toMatch(/<h1[^>]*>Cookie Policy<\/h1>/)
        expect((body.match(/<h1[\s>]/g) ?? []).length).toBe(1)
        expect(body).toContain(`rel="canonical" href="${company.origin}${path}"`)
    })

    it("titles and describes itself for a search engine", () => {
        expect(body).toContain("<title>Cookie Policy | Atlantic Blue</title>")
        expect(body).toMatch(/<meta name="description" content="[^"]+"/)
    })

    it("says when it was last updated", () => {
        expect(text).toMatch(/Last updated: \d{1,2} \w+ \d{4}/)
    })

    // A visitor cannot judge a cookie they cannot name, and cannot judge how
    // long it follows them without the lifetime.
    it("names every cookie the site can set, with a purpose and a lifetime", () => {
        for (const [name, lifetime] of [
            [consentCookieName, "12 months"],
            ["_ga", "2 years"],
            ["_ga_<measurement id>", "2 years"],
        ] as const) {
            const at = text.indexOf(name)
            expect(at, `${name} is not named`).toBeGreaterThanOrEqual(0)
            expect(text.slice(at, at + 600), `${name} has no lifetime`).toContain(lifetime)
        }

        expect(text).toContain("Google Analytics")
    })

    it("says that nothing from Google loads until the visitor accepts", () => {
        expect(text).toMatch(/only after you accept/i)
    })

    it("tells the visitor how to change the answer", () => {
        expect(text).toMatch(/cookie settings/i)
    })
})

// Step 7 loads the Google tag. Until then no page may carry Google code at all,
// whatever the visitor answered.
describe("no page loads Google code in any state", () => {
    const states = ["", `${consentCookieName}=granted`, `${consentCookieName}=denied`]

    it.each(states)("with the cookie header %s", async (cookie) => {
        for (const page of ["/", path]) {
            const response = await fetch(`${baseUrl}${page}`, {
                headers: cookie === "" ? {} : { cookie },
            })
            const body = await response.text()

            expect(response.status).toBe(200)
            expect(body).not.toContain("googletagmanager.com")
            expect(body).not.toContain("google-analytics.com")
            expect(body).not.toMatch(/gtag\(/)
        }
    })
})

describe("the footer reaches the cookie policy and the cookie settings", () => {
    it.each(["/", "/services", "/work", "/privacy", path])("from %s", async (from) => {
        const response = await fetch(`${baseUrl}${from}`)
        const body = await response.text()

        expect(response.status).toBe(200)
        expect(body).toContain(`href="${path}"`)
        expect(readableText(body)).toMatch(/cookie settings/i)
    })

    // The banner lives in the layout, so every page carries the place it fills.
    // A banner that is only a component is a banner nobody is ever shown.
    it.each(["/", "/services", path])("carries the banner on %s", async (from) => {
        const body = await (await fetch(`${baseUrl}${from}`)).text()

        expect(body).toContain('id="consent-banner"')
        expect(body).not.toContain('aria-label="Cookies"')
    })
})

describe("the sitemap", () => {
    it("lists the cookie policy now the page exists", async () => {
        const body = await (await fetch(`${baseUrl}/sitemap.xml`)).text()

        expect(body).toContain(`<loc>${company.origin}${path}</loc>`)
    })
})
