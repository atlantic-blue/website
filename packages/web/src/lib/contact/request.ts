export interface Attribution {
    readonly utmSource?: string
    readonly utmMedium?: string
    readonly utmCampaign?: string
    readonly utmTerm?: string
    readonly utmContent?: string
    readonly gclid?: string
    readonly referrerHost?: string
}

export interface Enquiry {
    readonly name: string
    readonly email: string
    readonly company?: string
    readonly message: string
    readonly pagePath: string
    readonly attribution: Attribution
    readonly honeypot: boolean
}

export type Reasons = Record<string, string>

export type Reading = { readonly enquiry: Enquiry } | { readonly reasons: Reasons }

const fields = ["name", "email", "company", "message", "website", "pagePath", "attribution"]

const attributionCaps: Record<string, number> = {
    utmSource: 100,
    utmMedium: 100,
    utmCampaign: 100,
    utmTerm: 100,
    utmContent: 100,
    gclid: 200,
    referrerHost: 253,
}

const isObject = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null && !Array.isArray(value)

const trimmed = (value: unknown): string | undefined =>
    typeof value === "string" ? value.trim() : undefined

/** One at sign, something on each side of it, and no space anywhere. */
const looksLikeAnAddress = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

const within = (value: string, least: number, most: number): boolean =>
    value.length >= least && value.length <= most

export const readEnquiry = (body: unknown): Reading => {
    if (!isObject(body)) {
        return { reasons: { body: "send a json object" } }
    }

    const reasons: Reasons = {}
    for (const field of Object.keys(body)) {
        if (!fields.includes(field)) {
            reasons[field] = "the request does not hold this field"
        }
    }

    const name = trimmed(body.name)
    if (name === undefined || !within(name, 1, 100)) {
        reasons.name = "give a name of 1 to 100 characters"
    }

    const email = trimmed(body.email)
    if (email === undefined || email.length > 254 || !looksLikeAnAddress(email)) {
        reasons.email = "give an email address of at most 254 characters"
    }

    const company = trimmed(body.company)
    if (body.company !== undefined && (company === undefined || company.length > 100)) {
        reasons.company = "give a company of at most 100 characters"
    }

    const message = trimmed(body.message)
    if (message === undefined || !within(message, 10, 5_000)) {
        reasons.message = "give a message of 10 to 5000 characters"
    }

    const pagePath = trimmed(body.pagePath)
    if (pagePath === undefined || !within(pagePath, 1, 200)) {
        reasons.pagePath = "give the page path, at most 200 characters"
    }

    const website = body.website === undefined ? "" : trimmed(body.website)
    if (website === undefined) {
        reasons.website = "leave this field empty"
    }

    const attribution = readAttribution(body.attribution, reasons)

    if (Object.keys(reasons).length > 0) {
        return { reasons }
    }

    return {
        enquiry: {
            name: name ?? "",
            email: email ?? "",
            ...(company === undefined || company === "" ? {} : { company }),
            message: message ?? "",
            pagePath: pagePath ?? "",
            attribution,
            honeypot: (website ?? "") !== "",
        },
    }
}

const readAttribution = (value: unknown, reasons: Reasons): Attribution => {
    if (value === undefined) {
        return {}
    }
    if (!isObject(value)) {
        reasons.attribution = "send an object or nothing"
        return {}
    }

    const held: Record<string, string> = {}
    for (const [field, sent] of Object.entries(value)) {
        const cap = attributionCaps[field]
        if (cap === undefined) {
            reasons[`attribution.${field}`] = "the request does not hold this field"
            continue
        }
        const text = trimmed(sent)
        if (text === undefined || text.length > cap) {
            reasons[`attribution.${field}`] = `give at most ${cap} characters`
            continue
        }
        if (text !== "") {
            held[field] = text
        }
    }
    return held
}
