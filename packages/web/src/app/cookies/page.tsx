import type { Metadata } from "next"
import Link from "next/link"

import { Eyebrow, Heading, Section, Title } from "@/components/ui/section"
import { consentCookieName } from "@/lib/consent"
import { company } from "@/lib/site"

export const metadata: Metadata = {
    title: "Cookie Policy",
    description:
        "The cookies this site can set, what each one is for, how long it lasts, and how to change your answer.",
    alternates: { canonical: "/cookies" },
}

const lastUpdated = "19 November 2026"

const bold = "font-semibold text-ink"
const anchor =
    "break-words text-accent underline decoration-line underline-offset-4 hover:decoration-accent"
const body = "mt-5 max-w-[68ch] text-dim"

interface Cookie {
    readonly name: string
    readonly setBy: string
    readonly purpose: string
    readonly lifetime: string
}

const cookies: readonly Cookie[] = [
    {
        name: consentCookieName,
        setBy: "this site",
        purpose:
            "It keeps your answer to the banner, granted or denied. Without it the site asks you again on every page, and it forgets a refusal. It is strictly necessary, so it is set whatever you answer.",
        lifetime: "12 months",
    },
    {
        name: "_ga",
        setBy: "Google Analytics, only after you accept",
        purpose: "It tells one browser from another, so one visit is counted once.",
        lifetime: "2 years",
    },
    {
        name: "_ga_<measurement id>",
        setBy: "Google Analytics, only after you accept",
        purpose:
            "It keeps the state of your visit, so the pages you read in one sitting are counted as one visit.",
        lifetime: "2 years",
    },
]

const CookiesPage = () => (
    <>
        <Section className="pt-12 sm:pt-20">
            <Eyebrow>Atlantic Blue</Eyebrow>
            <Title>Cookie Policy</Title>
            <p className="mt-6 max-w-[68ch] text-dim">
                <strong className={bold}>Last updated:</strong> {lastUpdated}
            </p>
        </Section>

        <Section className="border-t border-line">
            <section>
                <Heading>What this policy covers</Heading>
                <p className={body}>
                    This policy says what {company.origin.replace("https://", "")} can store on your
                    device, what each item is for, and how long it lasts. What happens to an enquiry
                    you send is in the{" "}
                    <Link href="/privacy" className={anchor}>
                        privacy policy
                    </Link>
                    .
                </p>
            </section>

            <section className="mt-12">
                <Heading>Your answer decides</Heading>
                <p className={body}>
                    A banner asks you to accept or reject analytics. Accept and Reject carry the
                    same weight. Nothing from Google loads until you accept, and if you reject,
                    neither Google cookie is set. The site works either way.
                </p>
                <p className={body}>
                    We keep your answer so that you are asked once. You can change it at any time
                    with Cookie settings, at the foot of every page.
                </p>
            </section>

            <section className="mt-12">
                <Heading>The cookies this site can set</Heading>
                {cookies.map((cookie) => (
                    <div key={cookie.name} className="mt-6 max-w-[68ch]">
                        <p className="font-mono text-sm text-ink">{cookie.name}</p>
                        <p className="mt-2 text-dim">
                            <strong className={bold}>Set by:</strong> {cookie.setBy}
                        </p>
                        <p className="mt-2 text-dim">
                            <strong className={bold}>Purpose:</strong> {cookie.purpose}
                        </p>
                        <p className="mt-2 text-dim">
                            <strong className={bold}>Lifetime:</strong> {cookie.lifetime}
                        </p>
                    </div>
                ))}
                <p className={body}>
                    Google documents 2 years as the default life of both Google Analytics cookies.
                    The measurement id in the second name is the identifier of our Google Analytics
                    property.
                </p>
            </section>

            <section className="mt-12">
                <Heading>Nothing else loads from another host</Heading>
                <p className={body}>
                    This site serves its own fonts, its own images and its own code. There is no
                    advertising network, no social widget and no embedded video, so no other company
                    can set a cookie through this site.
                </p>
            </section>

            <section className="mt-12">
                <Heading>How to change your answer</Heading>
                <p className={body}>
                    Use Cookie settings at the foot of any page. The banner opens again, and your
                    new answer replaces the old one.
                </p>
                <p className={body}>
                    You can also delete cookies in your browser. If you delete {consentCookieName},
                    the banner asks you the next time you arrive.
                </p>
            </section>

            <section className="mt-12">
                <Heading>Questions and changes</Heading>
                <p className={body}>
                    Write to{" "}
                    <a href={`mailto:${company.email}`} className={anchor}>
                        {company.email}
                    </a>{" "}
                    about anything on this page. We update this page when the cookies change, and
                    the date at the top is the date of the last change.
                </p>
            </section>
        </Section>
    </>
)

export default CookiesPage
