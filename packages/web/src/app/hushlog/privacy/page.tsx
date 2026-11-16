import type { Metadata } from "next"
import { Fragment } from "react"

import { Eyebrow, Heading, Section, Title } from "@/components/ui/section"
import { hushLogPrivacy, type Span } from "@/lib/hushlog-privacy"

const policy = hushLogPrivacy

export const metadata: Metadata = {
    title: `${policy.product} Privacy Policy`,
    description:
        "How HushLog handles your data. Your recordings, your scores and your sleep answers stay on your phone. Google serves the advertisements and Meta measures the campaigns.",
    alternates: { canonical: "/hushlog/privacy" },
}

const bold = "font-semibold text-ink"
const anchor =
    "break-words text-accent underline decoration-line underline-offset-4 hover:decoration-accent"

const Spans = ({ spans }: { spans: readonly Span[] }) => (
    <>
        {spans.map((span, index) => {
            if (typeof span === "string") {
                return <Fragment key={index}>{span}</Fragment>
            }
            if ("bold" in span) {
                return (
                    <strong key={index} className={bold}>
                        {span.bold}
                    </strong>
                )
            }
            if ("link" in span) {
                return (
                    <a key={index} href={span.link} className={anchor}>
                        {span.label ?? span.link}
                    </a>
                )
            }
            return <br key={index} />
        })}
    </>
)

const HushLogPrivacyPage = () => (
    <>
        <Section className="pt-12 sm:pt-20">
            <Eyebrow>{policy.product}</Eyebrow>
            <Title>{policy.title}</Title>
            <p className="mt-6 max-w-[68ch] text-dim">
                <strong className={bold}>{policy.product}</strong> — {policy.publisher}
                <br />
                <strong className={bold}>Effective date:</strong> {policy.effectiveDate}
                <br />
                <strong className={bold}>Last updated:</strong> {policy.lastUpdated}
            </p>
        </Section>

        <Section className="border-t border-line">
            {policy.parts.map((part) => (
                <section key={part.heading} className="mt-12 first:mt-0">
                    <Heading>{part.heading}</Heading>
                    {part.blocks.map((block, index) =>
                        "paragraph" in block ? (
                            <p key={index} className="mt-5 max-w-[68ch] text-dim">
                                <Spans spans={block.paragraph} />
                            </p>
                        ) : (
                            <ul
                                key={index}
                                className="mt-5 max-w-[68ch] list-disc space-y-2 pl-5 text-dim"
                            >
                                {block.list.map((item, itemIndex) => (
                                    <li key={itemIndex}>
                                        <Spans spans={item} />
                                    </li>
                                ))}
                            </ul>
                        ),
                    )}
                </section>
            ))}
        </Section>
    </>
)

export default HushLogPrivacyPage
