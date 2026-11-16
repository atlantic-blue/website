/**
 * The privacy policy for atlanticblue.solutions. The text is data rather than
 * markup because an HTML entity inside JSX text loses the space in front of it,
 * which silently joined a bold label to the sentence after it on the other
 * policy page.
 */

export interface BoldSpan {
    readonly bold: string
}

export interface LinkSpan {
    readonly link: string
    /** Shown instead of the address itself, where the address is not the words. */
    readonly label?: string
}

export interface BreakSpan {
    readonly newLine: true
}

export type Span = string | BoldSpan | LinkSpan | BreakSpan

export type PolicyBlock =
    { readonly paragraph: readonly Span[] } | { readonly list: readonly (readonly Span[])[] }

export interface PolicyPart {
    readonly heading: string
    readonly blocks: readonly PolicyBlock[]
}

export interface Policy {
    readonly title: string
    readonly lastUpdated: string
    readonly parts: readonly PolicyPart[]
}

export const privacy: Policy = {
    title: "Privacy Policy",
    lastUpdated: "",
    parts: [],
}

/** The words a reader sees, with a line break where the policy has one. */
export const plainText = (spans: readonly Span[]): string =>
    spans
        .map((span) => {
            if (typeof span === "string") {
                return span
            }
            if ("bold" in span) {
                return span.bold
            }
            if ("link" in span) {
                return span.label ?? span.link
            }
            return "\n"
        })
        .join("")
