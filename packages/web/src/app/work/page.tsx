import type { Metadata } from "next"
import Link from "next/link"

import { Eyebrow, Lede, Section, Title } from "@/components/ui/section"
import { engagements } from "@/lib/work"

export const metadata: Metadata = {
    title: "Work",
    description:
        "Playback, streaming delivery, reliability and product engineering inside ITV, Sky, DAZN, castLabs, Utility Warehouse and Plentific.",
    alternates: { canonical: "/work" },
}

const WorkPage = () => (
    <>
        <Section className="pt-12 sm:pt-20">
            <Eyebrow>Work</Eyebrow>
            <Title>Where the work has been</Title>
            <Lede>
                Each of these describes the shape of the problem rather than the client&apos;s
                numbers. Their measurements are theirs to publish.
            </Lede>
        </Section>

        <Section className="border-t border-line">
            <ul className="grid gap-6 md:grid-cols-2">
                {engagements.map((engagement) => (
                    <li key={engagement.slug} className="border border-line bg-surface p-5 sm:p-6">
                        <p className="font-mono text-xs uppercase tracking-[0.12em] text-dim">
                            {engagement.client} &middot; {engagement.period}
                        </p>
                        <h2 className="mt-3 text-lg font-semibold tracking-[-0.01em] sm:text-xl">
                            <Link
                                href={`/work/${engagement.slug}`}
                                className="text-accent underline decoration-line underline-offset-4 hover:decoration-accent"
                            >
                                {engagement.title}
                            </Link>
                        </h2>
                        <p className="mt-3 text-[0.9375rem] text-dim">{engagement.summary}</p>
                    </li>
                ))}
            </ul>
        </Section>
    </>
)

export default WorkPage
