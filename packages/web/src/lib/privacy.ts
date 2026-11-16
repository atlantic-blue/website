/**
 * The privacy policy for this website. The text is data rather than markup
 * because an HTML entity inside JSX text loses the space in front of it, which
 * silently joined a bold label to the sentence after it on the HushLog policy.
 *
 * Every fact here is read from the approved design in `.krewe/design.md`, from
 * `site.ts` or from `infra/site`. Nothing is invented: a processor, a retention
 * period or a cookie that is not in one of those three places does not belong
 * on this page.
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

const mail = {
    link: "mailto:hello@atlanticblue.solutions",
    label: "hello@atlanticblue.solutions",
} as const

export const privacy: Policy = {
    title: "Privacy Policy",
    lastUpdated: "16 November 2026",
    parts: [
        {
            heading: "Who we are",
            blocks: [
                {
                    paragraph: [
                        "Atlantic Blue Solutions Ltd is the controller of the data this website collects. We are registered in England and Wales, company number 14468993. Our registered office is 86-90 Paul Street, London, EC2A 4NE, United Kingdom.",
                    ],
                },
                {
                    paragraph: ["Write to us about anything on this page at ", mail, "."],
                },
            ],
        },
        {
            heading: "What this policy covers",
            blocks: [
                {
                    paragraph: [
                        "This policy covers atlanticblue.solutions, the website you are reading, and the enquiries people send from it.",
                    ],
                },
                {
                    paragraph: [
                        "It does not cover HushLog, our iPhone application. HushLog keeps your data on your phone and has its own policy at ",
                        {
                            link: "/hushlog/privacy",
                            label: "atlanticblue.solutions/hushlog/privacy",
                        },
                        ".",
                    ],
                },
            ],
        },
        {
            heading: "What we collect",
            blocks: [
                {
                    paragraph: [
                        "This website has one form, the contact form. When you send it, we collect:",
                    ],
                },
                {
                    list: [
                        ["your name"],
                        ["your email address"],
                        ["your company, if you give it. The field is optional."],
                        ["your message"],
                        ["the page you sent it from"],
                    ],
                },
                {
                    paragraph: [
                        "If you accept analytics, the form also sends the campaign values in the address you arrived with, which are the utm values and the gclid, and the host of the page that linked you to us. If you do not accept analytics, the form sends none of them and we keep only the page you sent the form from.",
                    ],
                },
                {
                    paragraph: [
                        "We count the enquiries that come from one internet address, to keep the form usable. To do that we keep a one way hash of the address and the hour, made with SHA 256. ",
                        { bold: "We do not store the address itself." },
                        " The count is deleted within two hours.",
                    ],
                },
            ],
        },
        {
            heading: "Why we hold it",
            blocks: [
                {
                    paragraph: [
                        "We hold your enquiry to read it and to answer you. Our lawful basis is our legitimate interest in answering a person who writes to us.",
                    ],
                },
                {
                    paragraph: [
                        "We hold the campaign values to know which link or advertisement brought you here. Our lawful basis for those is your consent, which you give when you accept analytics. You can refuse, and we then collect none of them.",
                    ],
                },
                {
                    paragraph: [
                        "We hold the hash of your internet address to limit how many enquiries come from one place in one hour. Our lawful basis is our legitimate interest in stopping a flood of them.",
                    ],
                },
                {
                    paragraph: ["We send you no marketing. We put nobody on a list."],
                },
            ],
        },
        {
            heading: "How long we keep it",
            blocks: [
                {
                    paragraph: [
                        "We delete an enquiry 24 months after it arrives. Each record carries its own expiry time and the database removes it then, so the deletion needs nobody to remember it.",
                    ],
                },
                {
                    paragraph: [
                        "Each enquiry also arrives in our mailbox as an email, and we reply from there. That copy and the conversation after it stay in the mailbox until we delete them.",
                    ],
                },
            ],
        },
        {
            heading: "Who else handles it",
            blocks: [
                { paragraph: ["Two companies handle data for us. Here is what each one does."] },
                {
                    list: [
                        [
                            { bold: "Amazon Web Services." },
                            " It serves this website with CloudFront and AWS Lambda. It holds each enquiry in DynamoDB. It sends the enquiry to our mailbox with Amazon Simple Email Service.",
                        ],
                        [
                            { bold: "Google." },
                            " Google Analytics 4 counts the visits to this website. It runs only after you accept it, and it receives nothing before that.",
                        ],
                    ],
                },
                {
                    paragraph: [
                        "We sell your data to nobody. We give your enquiry to no other company.",
                    ],
                },
            ],
        },
        {
            heading: "Where your data is held",
            blocks: [
                {
                    paragraph: [
                        "Your enquiry is held in the Amazon Web Services region us-east-1, in the United States.",
                    ],
                },
                {
                    paragraph: [
                        "A transfer of personal data out of the United Kingdom needs a safeguard. The safeguard here is the standard contractual clauses with the International Data Transfer Addendum of the United Kingdom. Amazon Web Services and Google both publish these terms, and we accept them as part of our contract with each company.",
                    ],
                },
            ],
        },
        {
            heading: "Analytics",
            blocks: [
                {
                    paragraph: [
                        "This website counts visits with Google Analytics 4. The Google code loads only after you accept analytics. Until you accept, no Google code loads and Google receives nothing from this website. If you refuse, nothing loads at all.",
                    ],
                },
                {
                    paragraph: [
                        "Analytics tells us how many people read a page, and which link or campaign brought them. It does not tell us who you are, and we do not try to find out.",
                    ],
                },
                { paragraph: ["You can change your answer at any time."] },
            ],
        },
        {
            heading: "Your rights",
            blocks: [
                { paragraph: ["The law gives you these rights over the data we hold about you:"] },
                {
                    list: [
                        ["the right of access: you can ask for a copy of it"],
                        ["the right of correction: you can ask us to correct it where it is wrong"],
                        ["the right of deletion: you can ask us to delete it"],
                        [
                            "the right of restriction: you can ask us to stop using it while we answer a question about it",
                        ],
                        ["the right of objection: you can object to our use of it"],
                        [
                            "the right of portability: you can ask for it in a form you can give to somebody else",
                        ],
                    ],
                },
                {
                    paragraph: [
                        "To use any of them, write to ",
                        mail,
                        ". We answer within one month. We ask for nothing to prove who you are beyond the address the enquiry came from.",
                    ],
                },
            ],
        },
        {
            heading: "How to complain",
            blocks: [
                {
                    paragraph: [
                        "Write to ",
                        mail,
                        " first. We would like the chance to put it right.",
                    ],
                },
                {
                    paragraph: [
                        "You can also complain to the Information Commissioner's Office, the data protection regulator of the United Kingdom: ",
                        { link: "https://ico.org.uk" },
                    ],
                },
            ],
        },
        {
            heading: "Changes to this policy",
            blocks: [
                {
                    paragraph: [
                        "When this policy changes we publish the new version here and change the last updated date at the top of the page.",
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
