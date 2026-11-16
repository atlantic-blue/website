import type { Metadata } from "next"
import Link from "next/link"

import { Eyebrow, Heading, Lede, Section, Title } from "@/components/ui/section"

const supportEmail = "support@atlanticblue.co.uk"
const productPage = "https://atlanticblue.solutions/hushlog"

export const metadata: Metadata = {
    title: "HushLog Support",
    description:
        "Help with HushLog, the snoring recorder for iPhone. Write to support@atlanticblue.co.uk, or read the answers to the questions people ask most.",
    alternates: { canonical: "/hushlog/support" },
}

const anchor =
    "break-words text-accent underline decoration-line underline-offset-4 hover:decoration-accent"

const questions: readonly { readonly question: string; readonly answer: string }[] = [
    {
        question: "Does it cost anything to record a night?",
        answer: "No. Recording is free on every night. There is no limit and there is nothing to unlock.",
    },
    {
        question: "Why do I see an advertisement?",
        answer: "One short advertisement opens a night's report. One payment in the app removes every advertisement on that phone, for good.",
    },
    {
        question: "I paid, and the advertisements came back. What do I do?",
        answer: "The App Store restores the payment on a reinstall and on a new device. The app also has a restore control in Settings.",
    },
    {
        question: "Where do my recordings go?",
        answer: "They stay on the phone. The app sends no audio anywhere. There is no account and no sign in.",
    },
    {
        question: "Does the app record when the screen is off?",
        answer: "Yes. The app keeps recording when the screen turns off. It also keeps recording when the phone is locked.",
    },
    {
        question: "Why does the screen go dark?",
        answer: "The screen goes dark about half a minute after a recording starts, so the light does not keep you awake. Touch the screen to bring it back.",
    },
    {
        question: "Where do I put the phone?",
        answer: "Put the phone on a bedside table, within about a metre of your head. This gives the best result.",
    },
    {
        question: "How do I delete a recording?",
        answer: "Delete a night in the app. If you delete the app, the phone removes every recording with it.",
    },
    {
        question: "Can HushLog tell me what is wrong with my sleep?",
        answer: "No. HushLog is not a medical device and it diagnoses nothing.",
    },
]

const HushLogSupportPage = () => (
    <>
        <Section className="pt-12 sm:pt-20">
            <Eyebrow>HushLog</Eyebrow>
            <Title>HushLog Support</Title>
            <Lede>
                This page is for HushLog, the snoring recorder for iPhone. The product page is at{" "}
                <a href={productPage} className={anchor}>
                    {productPage}
                </a>
                .
            </Lede>
        </Section>

        <Section className="border-t border-line">
            <Heading>Contact</Heading>
            <p className="mt-5 max-w-[68ch] text-dim">
                Write to{" "}
                <a href={`mailto:${supportEmail}`} className={anchor}>
                    {supportEmail}
                </a>
                . We answer in English.
            </p>
        </Section>

        <Section className="border-t border-line">
            <Heading>Common questions</Heading>
            <dl className="mt-8 max-w-[68ch] space-y-8">
                {questions.map((item) => (
                    <div key={item.question}>
                        <dt className="text-lg font-semibold tracking-[-0.01em] text-ink">
                            {item.question}
                        </dt>
                        <dd className="mt-3 text-dim">{item.answer}</dd>
                    </div>
                ))}
            </dl>
        </Section>

        <Section className="border-t border-line">
            <Heading>Privacy</Heading>
            <p className="mt-5 max-w-[68ch] text-dim">
                The HushLog privacy policy is at{" "}
                <Link href="/hushlog/privacy" className={anchor}>
                    /hushlog/privacy
                </Link>
                .
            </p>
        </Section>
    </>
)

export default HushLogSupportPage
