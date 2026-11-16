import type { Metadata } from "next"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Eyebrow, Heading, Lede, Section, Title } from "@/components/ui/section"

export const metadata: Metadata = {
    title: "HushLog",
    description:
        "HushLog is a snoring recorder for iPhone. It records every night for nothing, scores the night from 0 to 100, and keeps every recording on the phone.",
    alternates: { canonical: "/hushlog" },
}

const appStore = "https://apps.apple.com/gb/app/hush-log-snoring-recorder/id6759836267"

const link = "text-accent underline decoration-line underline-offset-4 hover:decoration-accent"

const parts = [
    {
        eyebrow: "What you get",
        heading: "One night, read five ways",
        points: [
            "A snore score from 0 to 100 for the night.",
            "A timeline of the whole night.",
            "The loudest moments, ready to play.",
            "Tags for the remedies and the factors you try.",
            "An export of your own data, as a file you keep.",
        ],
    },
    {
        eyebrow: "What it costs",
        heading: "Record for nothing, pay once if you want quiet",
        points: [
            "Recording is free on every night.",
            "One short advertisement opens a night's report.",
            "One payment removes every advertisement for good.",
            "There is no subscription.",
        ],
    },
    {
        eyebrow: "Privacy",
        heading: "The night stays on the phone",
        points: [
            "Your recordings stay on your phone.",
            "The app sends no audio anywhere.",
            "There is no account and no sign in.",
        ],
    },
]

const HushLogPage = () => (
    <>
        <Section className="pt-12 sm:pt-20">
            <Eyebrow>iPhone app</Eyebrow>
            <Title className="max-w-[14ch]">HushLog</Title>
            <Lede>A snoring recorder for iPhone. It records every night for nothing.</Lede>
            <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild>
                    <a href={appStore}>Get HushLog on the App Store</a>
                </Button>
            </div>
        </Section>

        {parts.map((part) => (
            <Section key={part.eyebrow} className="border-t border-line">
                <Eyebrow>{part.eyebrow}</Eyebrow>
                <Heading className="mt-3">{part.heading}</Heading>
                <ul className="mt-6 max-w-[68ch] list-disc space-y-2 pl-5 text-dim">
                    {part.points.map((point) => (
                        <li key={point}>{point}</li>
                    ))}
                </ul>
            </Section>
        ))}

        <Section className="border-t border-line">
            <Eyebrow>More</Eyebrow>
            <Heading className="mt-3">Where to read more and where to write</Heading>
            <ul className="mt-6 max-w-[68ch] space-y-3 text-dim">
                <li>
                    <a href={appStore} className={link}>
                        HushLog on the App Store
                    </a>
                </li>
                <li>
                    <Link href="/hushlog/privacy" className={link}>
                        Privacy policy
                    </Link>
                </li>
                <li>
                    <Link href="/hushlog/support" className={link}>
                        Support
                    </Link>
                </li>
            </ul>
        </Section>
    </>
)

export default HushLogPage
