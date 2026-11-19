export type Consent = "granted" | "denied"

export const consentCookieName = "abs_consent"

const twelveMonthsInSeconds = 31_536_000

export const consentCookieValue = (choice: Consent, protocol: string): string => {
    const parts = [
        `${consentCookieName}=${choice}`,
        `Max-Age=${twelveMonthsInSeconds}`,
        "Path=/",
        "SameSite=Lax",
    ]

    // A browser drops a Secure cookie on http, which is what a development
    // server speaks, so the answer would be forgotten there on every page.
    if (protocol === "https:") {
        parts.push("Secure")
    }

    return parts.join("; ")
}

export const consentFromCookies = (cookies: string): Consent | null => {
    const entry = cookies
        .split(";")
        .map((part) => part.trim())
        .find((part) => part.startsWith(`${consentCookieName}=`))

    const value = entry?.slice(consentCookieName.length + 1)
    return value === "granted" || value === "denied" ? value : null
}

export const readConsent = (): Consent | null => consentFromCookies(document.cookie)

const listeners = new Set<() => void>()

const announce = (): void => {
    for (const listen of listeners) {
        listen()
    }
}

export const whenTheAnswerChanges = (listen: () => void): (() => void) => {
    listeners.add(listen)
    return () => {
        listeners.delete(listen)
    }
}

let askingAgain = false

export const keepConsent = (choice: Consent): void => {
    document.cookie = consentCookieValue(choice, window.location.protocol)
    askingAgain = false
    announce()
}

export const askTheVisitorAgain = (): void => {
    askingAgain = true
    announce()
}

export const isAskingTheVisitor = (): boolean => askingAgain || readConsent() === null
