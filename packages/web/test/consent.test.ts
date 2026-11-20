// The banner decides in the browser, so this file runs in jsdom. The pages are
// still read from the running server, as the rest of the suite does.
// @vitest-environment jsdom

import { createElement } from "react"

import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeAll, beforeEach, describe, expect, inject, it, vi } from "vitest"

import { ConsentBanner, CookieSettings } from "../src/components/consent-banner"
import { ContactForm } from "../src/components/contact-form"
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

const offsetHeightOfEveryElement = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    "offsetHeight",
)

/**
 * jsdom draws no layout, so every element there reports a height of zero. The
 * banner is given a height, so the space the page keeps can be read against it.
 */
const theBannerIsTall = (pixels: number): void => {
    Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
        configurable: true,
        get: () => pixels,
    })
}

const restoreTheHeights = (): void => {
    if (offsetHeightOfEveryElement !== undefined) {
        Object.defineProperty(HTMLElement.prototype, "offsetHeight", offsetHeightOfEveryElement)
    }
}

/** The space the page keeps at its foot while the banner asks, in pixels. */
const spaceAtTheFootOfThePage = (): number => {
    const space = document.getElementById("consent-banner-space")
    return space === null ? 0 : Number.parseFloat(space.style.height || "0")
}

const theVisitorLoadsTheContactPage = (): void => {
    render(
        createElement(
            "div",
            null,
            createElement(ContactForm, { pagePath: "/contact" }),
            createElement(ConsentBanner),
        ),
    )
}

/** jsdom has no ResizeObserver, so the path every browser takes needs one here. */
const watchTheSizeOfAnElement = (): { readonly report: () => void } => {
    const told: (() => void)[] = []

    vi.stubGlobal(
        "ResizeObserver",
        class {
            constructor(tell: () => void) {
                told.push(tell)
            }
            observe(): void {}
            unobserve(): void {}
            disconnect(): void {}
        },
    )

    return {
        report: () => {
            for (const tell of told) {
                act(tell)
            }
        },
    }
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

// The banner is fixed to the bottom of the viewport, so it is out of the page
// flow and lies over whatever the foot of the page holds. On /contact that is
// the send button: the click lands on the banner and the enquiry never sends,
// so the site loses the enquiry it exists to collect. A banner may ask for an
// answer. It may not take the page away while it waits.
describe("the open consent banner covers no control on the page", () => {
    beforeEach(forgetTheAnswer)

    afterEach(() => {
        cleanup()
        restoreTheHeights()
        vi.unstubAllGlobals()
    })

    it("keeps space at the foot of the page while it asks", () => {
        theBannerIsTall(104)
        theVisitorLoadsTheContactPage()

        expect(banner()).not.toBeNull()
        expect(screen.getByRole("button", { name: "Send enquiry" })).toBeDefined()
        expect(spaceAtTheFootOfThePage()).toBeGreaterThanOrEqual(104)
    })

    it("gives the space back after Accept", () => {
        theBannerIsTall(104)
        theVisitorLoadsTheContactPage()
        fireEvent.click(screen.getByRole("button", { name: "Accept" }))

        expect(banner()).toBeNull()
        expect(spaceAtTheFootOfThePage()).toBe(0)
    })

    it("gives the space back after Reject", () => {
        theBannerIsTall(104)
        theVisitorLoadsTheContactPage()
        fireEvent.click(screen.getByRole("button", { name: "Reject" }))

        expect(banner()).toBeNull()
        expect(spaceAtTheFootOfThePage()).toBe(0)
    })

    it("keeps no space from a visitor who answered already", () => {
        theBannerIsTall(104)
        theVisitorLoadsTheContactPage()
        fireEvent.click(screen.getByRole("button", { name: "Reject" }))
        cleanup()

        theVisitorLoadsTheContactPage()

        expect(banner()).toBeNull()
        expect(spaceAtTheFootOfThePage()).toBe(0)
    })

    // The banner holds one line of text beside two buttons, and both wrap to
    // more rows on a narrow phone. A space that keeps the height of the wide
    // banner leaves the send button under the tall one.
    it("follows the banner when a change of width makes it taller", () => {
        theBannerIsTall(104)
        theVisitorLoadsTheContactPage()

        theBannerIsTall(188)
        fireEvent(window, new Event("resize"))

        expect(spaceAtTheFootOfThePage()).toBeGreaterThanOrEqual(188)
    })

    // A webfont arrives after the first paint and the text then reflows, which
    // no resize event reports. Every browser the site serves watches the size
    // of an element instead.
    it("follows the banner when its own size changes under it", () => {
        const sizeWatchers = watchTheSizeOfAnElement()
        theBannerIsTall(104)
        theVisitorLoadsTheContactPage()

        theBannerIsTall(188)
        sizeWatchers.report()

        expect(spaceAtTheFootOfThePage()).toBeGreaterThanOrEqual(188)
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
