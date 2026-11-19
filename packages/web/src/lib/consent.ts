export type Consent = "granted" | "denied"

export const consentCookieName = "abs_consent"

export const consentCookieValue = (_choice: Consent, _protocol: string): string => ""

export const consentFromCookies = (_cookies: string): Consent | null => null

export const readConsent = (): Consent | null => null

export const keepConsent = (_choice: Consent): void => {}

export const askTheVisitorAgain = (): void => {}

export const whenAskedAgain =
    (_listen: () => void): (() => void) =>
    () => {}
