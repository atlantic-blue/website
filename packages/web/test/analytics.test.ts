// The tag is loaded in the browser, so the component tests run in jsdom. The
// pages, the policy and the workflow are read as the rest of the suite reads
// them: from the running server and from the source on disk.
// @vitest-environment jsdom

import { existsSync, readFileSync } from "node:fs"
import { dirname, join } from "node:path"

import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { createElement } from "react"
import { afterEach, beforeEach, describe, expect, inject, it } from "vitest"

import { Analytics, expiredGoogleCookies } from "../src/components/analytics"
import { ConsentBanner, CookieSettings } from "../src/components/consent-banner"
import { consentCookieName } from "../src/lib/consent"

const baseUrl = inject("baseUrl")

const measurementId = "G-ZZTESTABCD"
const googleHost = "https://www.googletagmanager.com"
const tagAddress = `${googleHost}/gtag/js`

const tags = (): HTMLScriptElement[] => [
    ...document.querySelectorAll<HTMLScriptElement>(`script[src^="${tagAddress}"]`),
]

const commands = (): unknown[][] =>
    (window.dataLayer ?? []).map((entry) => Array.from(entry as ArrayLike<unknown>))

const cookieNames = (): string[] =>
    document.cookie
        .split(";")
        .map((part) => part.trim().split("=")[0] ?? "")
        .filter((name) => name !== "")

const forget = (name: string): void => {
    document.cookie = `${name}=; Max-Age=0; Path=/`
}

/**
 * jsdom keeps one document for the whole file, so a tag or a cookie left by the
 * test before this one would answer for the code under test.
 */
const aFreshVisitor = (): void => {
    for (const name of cookieNames()) {
        forget(name)
    }
    for (const tag of tags()) {
        tag.remove()
    }
    window.dataLayer = undefined
    window.gtag = undefined
}

const theVisitorLoadsAPage = (id: string = measurementId): void => {
    render(
        createElement(
            "div",
            null,
            createElement(ConsentBanner),
            createElement(CookieSettings),
            createElement(Analytics, { measurementId: id }),
        ),
    )
}

const press = (name: string | RegExp): void => {
    fireEvent.click(screen.getByRole("button", { name }))
}

// United Kingdom law needs consent before a cookie that is not strictly
// necessary, and Google Analytics sets such cookies. So no visitor reaches
// Google before they agree. After Accept the operator gets counts, which is the
// baseline paid advertising needs. After a change to Reject the counting stops
// and the Google cookies go away. A site that counts first and asks later
// breaks the law. A site that asks and then counts nothing leaves the operator
// with no numbers at all.
describe("the google tag loads only after consent", () => {
    beforeEach(aFreshVisitor)
    afterEach(cleanup)

    it("reaches google with nothing while the visitor has not answered", () => {
        theVisitorLoadsAPage()

        expect(tags()).toHaveLength(0)
        expect(window.dataLayer).toBeUndefined()
    })

    it("reaches google with nothing after the visitor rejects", () => {
        theVisitorLoadsAPage()
        press("Reject")

        expect(tags()).toHaveLength(0)
        expect(window.dataLayer).toBeUndefined()
    })

    it("loads the tag when the visitor accepts, without a reload", () => {
        theVisitorLoadsAPage()
        expect(tags()).toHaveLength(0)

        press("Accept")

        expect(tags()).toHaveLength(1)
    })

    // A tag that blocks the document delays every visitor, including the ones
    // who came from an advertisement.
    it("asks google for the operator's property and lets the page draw first", () => {
        theVisitorLoadsAPage()
        press("Accept")

        const tag = tags()[0]
        expect(tag?.src).toBe(`${tagAddress}?id=${measurementId}`)
        expect(tag?.async).toBe(true)
    })

    // An event in step 8 is pushed through this function. A tag that loads
    // without it counts page views and nothing else.
    it("configures the same property and leaves gtag ready for an event", () => {
        theVisitorLoadsAPage()
        press("Accept")

        expect(typeof window.gtag).toBe("function")
        expect(commands()).toContainEqual(["config", measurementId])
        expect(commands().map((command) => command[0])).toContain("js")
    })

    // The measurement id is written into the bundle at build time. A build
    // without it must count nobody rather than ask Google about an empty
    // property.
    it("reaches google with nothing when the site was built without a property", () => {
        theVisitorLoadsAPage("")
        press("Accept")

        expect(tags()).toHaveLength(0)
        expect(window.dataLayer).toBeUndefined()
    })

    it("loads one tag, however many times the page draws", () => {
        theVisitorLoadsAPage()
        press("Accept")
        cleanup()
        theVisitorLoadsAPage()

        expect(tags()).toHaveLength(1)
    })

    it("stops counting and removes the google cookies when the visitor changes to reject", () => {
        theVisitorLoadsAPage()
        press("Accept")
        document.cookie = "_ga=GA1.1.1827339921.1763657520; Path=/"
        document.cookie = `_ga_${measurementId.slice(2)}=GS1.1.1763657520; Path=/`

        press(/cookie settings/i)
        press("Reject")

        expect(tags()).toHaveLength(0)
        expect(cookieNames()).not.toContain("_ga")
        expect(cookieNames()).not.toContain(`_ga_${measurementId.slice(2)}`)
    })

    // The refusal itself is remembered in abs_consent. A delete that takes it
    // too asks the same visitor the same question on the next page.
    it("keeps the answer when it removes the google cookies", () => {
        theVisitorLoadsAPage()
        press("Reject")

        expect(cookieNames()).toContain(consentCookieName)
    })

    // Google sets _ga on the registrable domain, and a delete only lands when it
    // repeats that domain. jsdom serves the suite from an address with one
    // label, so the domain form is proved here instead of in the document.
    it("writes the expired cookie for the domain google set it on", () => {
        const written = expiredGoogleCookies(
            `_ga=GA1.1.1; _ga_ABCDE=GS1.1.1; ${consentCookieName}=granted`,
            "www.atlanticblue.solutions",
        )

        expect(written).toEqual([
            "_ga=; Max-Age=0; Path=/",
            "_ga=; Max-Age=0; Path=/; Domain=.atlanticblue.solutions",
            "_ga_ABCDE=; Max-Age=0; Path=/",
            "_ga_ABCDE=; Max-Age=0; Path=/; Domain=.atlanticblue.solutions",
        ])
        expect(written.join(" ")).not.toContain(consentCookieName)
    })

    it("writes no domain when the site answers on an address with one label", () => {
        expect(expiredGoogleCookies("_ga=GA1.1.1", "localhost")).toEqual([
            "_ga=; Max-Age=0; Path=/",
        ])
    })
})

// The tag sits in the layout, so a visitor who accepts on any page is counted
// from that page on. A component that only one page renders counts a fraction
// of the site.
describe("every page carries the tag", () => {
    it.each(["/", "/services", "/work", "/contact", "/cookies"])("on %s", async (path) => {
        const response = await fetch(`${baseUrl}${path}`)
        const body = await response.text()

        expect(response.status).toBe(200)
        expect(body).toContain('id="analytics"')
        expect(body).not.toContain("googletagmanager.com")
    })
})

// A test file that runs in jsdom cannot read a path built from import.meta.url,
// because Vite rewrites that expression into an asset address and refuses a
// document above the package. So walk up from the working directory to the
// repository instead, and say so when the walk finds nothing.
const repositoryRoot = (): string => {
    let at = process.cwd()
    while (!existsSync(join(at, "infra", "site"))) {
        const above = dirname(at)
        if (above === at) {
            throw new Error(`no infra/site directory above ${process.cwd()}`)
        }
        at = above
    }
    return at
}

const read = (...parts: string[]): string => {
    const path = join(repositoryRoot(), ...parts)
    const source = readFileSync(path, "utf8")
    if (source.trim() === "") {
        throw new Error(`${path} is empty, so nothing below was checked`)
    }
    return source
}

const policyDirectives = (): Map<string, string[]> => {
    const source = read("infra", "site", "security-headers.tf")
    const list = /content_security_policy\s*=\s*join\("; ",\s*\[(.*?)\]\)/s.exec(source)?.[1]
    if (list === undefined) {
        throw new Error("no content security policy list in infra/site/security-headers.tf")
    }
    const directives = [...list.matchAll(/"([^"]+)"/g)].map((match) => match[1] ?? "")
    if (directives.length === 0) {
        throw new Error("the content security policy list is empty")
    }
    return new Map(
        directives.map((directive) => {
            const parts = directive.split(/\s+/)
            return [parts[0] ?? "", parts.slice(1)]
        }),
    )
}

// The policy the old site had no answer for at all now has to let two Google
// hosts through and nothing else. A policy that is too tight loads no tag, and
// the operator reads an empty report. A policy that opens up to every host
// gives the site away.
describe("the content security policy lets the tag through and nothing else", () => {
    it("allows the google tag script", () => {
        expect(policyDirectives().get("script-src")).toEqual([
            "'self'",
            "'unsafe-inline'",
            googleHost,
        ])
    })

    it("allows the measurement requests", () => {
        expect(policyDirectives().get("connect-src")).toEqual([
            "'self'",
            "https://*.google-analytics.com",
            "https://*.analytics.google.com",
            googleHost,
        ])
    })

    it("allows the measurement picture", () => {
        expect(policyDirectives().get("img-src")).toEqual([
            "'self'",
            "data:",
            "https://*.google-analytics.com",
            googleHost,
        ])
    })

    it("holds every other directive as it was", () => {
        const directives = policyDirectives()

        expect(directives.get("default-src")).toEqual(["'self'"])
        expect(directives.get("style-src")).toEqual(["'self'", "'unsafe-inline'"])
        expect(directives.get("font-src")).toEqual(["'self'"])
        expect(directives.get("frame-ancestors")).toEqual(["'none'"])
        expect(directives.get("base-uri")).toEqual(["'self'"])
        expect(directives.get("form-action")).toEqual(["'self'"])
        expect(directives.get("object-src")).toEqual(["'none'"])
    })

    it("names google in no other directive", () => {
        for (const [name, hosts] of policyDirectives()) {
            if (["script-src", "connect-src", "img-src"].includes(name)) {
                continue
            }
            expect(hosts.join(" "), `${name} names a google host`).not.toContain("google")
        }
    })
})

const stepsOfTheDeploy = (): string[] => {
    const source = read(".github", "workflows", "deploy.yml")
    const steps = source.split(/\n(?=      - )/).slice(1)
    if (steps.length === 0) {
        throw new Error("no steps in .github/workflows/deploy.yml")
    }
    return steps
}

// Next.js writes a NEXT_PUBLIC value into the bundle while it builds, so a
// variable that reaches only the running function reaches nobody. The gates
// build the site too, and that build stays without a property, so the suite
// keeps proving that an empty property loads nothing.
describe("the deploy passes the property into the build", () => {
    const variable = "NEXT_PUBLIC_GA_MEASUREMENT_ID"

    it("gives the measurement id to the step that builds the site", () => {
        const build = stepsOfTheDeploy().find((step) => step.includes("build:opennext"))

        expect(build).toBeDefined()
        expect(build).toContain(`${variable}: \${{ vars.${variable} }}`)
    })

    it("gives it to that step alone", () => {
        const steps = stepsOfTheDeploy().filter((step) => step.includes(variable))

        expect(steps).toHaveLength(1)
    })
})
