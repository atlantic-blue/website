/**
 * The HushLog privacy policy, word for word as the product publishes it. The
 * App Store listing links at this page, so the words belong to the product and
 * not to this site: change them in the product repository first.
 *
 * The text is data rather than markup because an HTML entity inside JSX text
 * loses the space in front of it, which silently joined a bold label to the
 * sentence after it.
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
    readonly product: string
    readonly publisher: string
    readonly effectiveDate: string
    readonly lastUpdated: string
    readonly parts: readonly PolicyPart[]
}

export const hushLogPrivacy: Policy = {
    title: "Privacy Policy",
    product: "HushLog",
    publisher: "Atlantic Blue Solutions LTD",
    effectiveDate: "1 March 2026",
    lastUpdated: "4 November 2026",
    parts: [
        {
            heading: "Overview",
            blocks: [
                {
                    paragraph: [
                        "HushLog is a snoring analysis app that records and analyses audio while you sleep. Your recordings, your scores and your sleep answers stay on your device. HushLog sends no audio and no result anywhere.",
                    ],
                },
                {
                    paragraph: [
                        "HushLog is free. One advertisement before a night's report pays for that. Google serves the advertisement and receives the data an advertisement needs, which this policy lists below. One payment inside the app removes every advertisement, and then HushLog asks Google for nothing.",
                    ],
                },
            ],
        },
        {
            heading: "Data We Collect",
            blocks: [
                {
                    paragraph: [
                        "HushLog has no server of its own and no account. Your recordings, your results and your sleep profile stay in the app's own storage, on your phone.",
                    ],
                },
                {
                    paragraph: [
                        "Data does leave your phone for the advertisements. It goes to Google, and a smaller amount goes to Meta. Both companies are named in Third-Party Services below, with what each one gets.",
                    ],
                },
                {
                    paragraph: [
                        "Neither company receives any audio, any recording, any snore score, any night or any answer you gave HushLog.",
                    ],
                },
            ],
        },
        {
            heading: "Data Stored On Your Device",
            blocks: [
                {
                    paragraph: [
                        "The following data is created and stored locally on your device only:",
                    ],
                },
                {
                    list: [
                        [{ bold: "Audio recordings" }, " of your sleep sessions"],
                        [
                            { bold: "Analysis results" },
                            " including snoring amplitude, classifications, and session summaries",
                        ],
                        [{ bold: "Session history" }, " for tracking trends over time"],
                    ],
                },
                {
                    paragraph: [
                        "This data is stored using on-device storage (SQLite) and the device file system. It is never transmitted off your device.",
                    ],
                },
            ],
        },
        {
            heading: "Microphone Access",
            blocks: [
                {
                    paragraph: [
                        "HushLog requires microphone access to record audio during sleep sessions. The microphone is only active when you explicitly start a recording session. Audio data captured by the microphone is stored locally and is never sent to any server.",
                    ],
                },
            ],
        },
        {
            heading: "Third-Party Services",
            blocks: [
                {
                    paragraph: [
                        { bold: "Google, an advertising network." },
                        " HushLog asks Google for one advertisement before a night's report. Google receives what it needs to serve that advertisement and to measure it. Google publishes the list for the advertising software it supplies, and it is this:",
                    ],
                },
                {
                    list: [
                        ["A device identifier"],
                        [
                            "Advertising data, which is the advertisements you were shown and what you did with them",
                        ],
                        [
                            "Your approximate location, which Google takes from your internet protocol address",
                        ],
                        ["Product interaction data"],
                        ["Performance data and crash logs about the advertisement"],
                    ],
                },
                {
                    paragraph: [
                        "The list is Google's own: ",
                        { link: "https://developers.google.com/admob/ios/privacy/data-disclosure" },
                    ],
                },
                {
                    paragraph: [
                        "How Google uses that data is described by Google, not by us: ",
                        { link: "https://policies.google.com/technologies/partner-sites" },
                        " and ",
                        { link: "https://policies.google.com/privacy" },
                    ],
                },
                {
                    paragraph: [
                        { bold: "Meta, for measuring advertising campaigns." },
                        " Meta's software runs in HushLog so that an advertising campaign can be told whether it brought somebody to the app. It reports three things to Meta: that the app was installed, that the app was opened, and that the payment to remove the advertisements was made. The payment is always reported as 14.99 pounds, whatever your own store front charged you. HushLog switches off that software's collection of your device's advertising identifier, so Meta does not receive it.",
                    ],
                },
                {
                    paragraph: [
                        "What Meta does with that data is described by Meta: ",
                        { link: "https://www.facebook.com/privacy/policy/" },
                    ],
                },
            ],
        },
        {
            heading: "Advertisements",
            blocks: [
                {
                    paragraph: [
                        "HushLog records every night for nothing, and one advertisement before a night's report is what pays for it. The advertisement fills the screen. You close it, and your report opens. Nothing else in HushLog carries an advertisement.",
                    ],
                },
                {
                    paragraph: [
                        { bold: "The tracking question." },
                        " iOS asks you once whether HushLog may track you across other companies' apps and websites. If you allow it, your device's advertising identifier reaches Google and the advertisements earn more. If you refuse it, that identifier does not reach Google. You see advertisements either way, and refusing costs you nothing in the app. HushLog always asks Google for an advertisement that is not personalised, whatever you answered.",
                    ],
                },
                {
                    paragraph: [
                        "In the European Economic Area, Google shows you its own consent message before the first advertisement. You answer Google there. HushLog keeps no record of your answer.",
                    ],
                },
                {
                    paragraph: [
                        { bold: "Removing them." },
                        " One payment inside the app removes every advertisement on that phone, for good. After that HushLog requests no advertisement at all, so Google is asked for nothing and receives nothing. The record of your payment is held in your device keychain, on the phone, and it is sent nowhere.",
                    ],
                },
            ],
        },
        {
            heading: "Data Sharing",
            blocks: [
                {
                    paragraph: [
                        "What HushLog sends goes to Google and to Meta, as described above, and to nobody else. No audio, no recording, no snore score and no sleep answer is ever sent anywhere.",
                    ],
                },
                {
                    paragraph: [
                        "Three paths off this phone exist, and only you open them. HushLog sends nothing down any of them on its own.",
                    ],
                },
                {
                    list: [
                        [
                            { bold: "Send feedback" },
                            ", in Settings, opens your own mail application with a message already written. The message carries the app version, and the goal you chose during the onboarding. Where you skipped that question, it carries the version alone. It carries nothing else.",
                        ],
                        [
                            { bold: "Export a report" },
                            ", ",
                            { bold: "Export All" },
                            " and ",
                            { bold: "Export Session" },
                            ", in Settings, make a file of your own nights and hand it to the iOS share sheet. You choose where it goes.",
                        ],
                        [
                            { bold: "Share this night" },
                            ", on a night's report, draws a picture of that night and hands it to the iOS share sheet. You choose where it goes.",
                        ],
                    ],
                },
                { paragraph: ["Nothing is sent unless you send it."] },
            ],
        },
        {
            heading: "Data Retention and Deletion",
            blocks: [
                {
                    paragraph: [
                        "All data is stored on your device. You can delete individual sessions within the app or remove all data by uninstalling the app.",
                    ],
                },
            ],
        },
        {
            heading: "Children's Privacy",
            blocks: [
                {
                    paragraph: [
                        "HushLog does not knowingly collect any information from children under the age of 13.",
                    ],
                },
            ],
        },
        {
            heading: "Changes to This Policy",
            blocks: [
                {
                    paragraph: [
                        "If we update this privacy policy, we will post the revised version here with an updated effective date.",
                    ],
                },
                {
                    paragraph: [
                        "On 4 November 2026 this policy changed, because the app changed: the download became free and advertising arrived with it. The sections on what is collected, on third party services, on advertisements and on sharing were rewritten for that. The advertising described here starts with the app version that carries it.",
                    ],
                },
            ],
        },
        {
            heading: "Contact",
            blocks: [
                { paragraph: ["If you have questions about this privacy policy, contact us at:"] },
                {
                    paragraph: [
                        { bold: "Atlantic Blue Solutions LTD" },
                        { newLine: true },
                        "Email: ",
                        {
                            link: "mailto:support@atlanticblue.co.uk",
                            label: "support@atlanticblue.co.uk",
                        },
                    ],
                },
            ],
        },
    ],
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
