import type { Metadata } from "next"
import { Fragment } from "react"

import { Eyebrow, Heading, Section, Title } from "@/components/ui/section"
import { privacy, type Span } from "@/lib/privacy"

const policy = privacy

export const metadata: Metadata = {
    title: policy.title,
    description:
        "What this site collects when you send an enquiry, how long we keep it, who else handles it, and how to use your rights.",
    alternates: { canonical: "/privacy" },
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

const PrivacyPage = () => (
    <>
        <Section className="pt-12 sm:pt-20">
            <Eyebrow>Atlantic Blue</Eyebrow>
            <Title>{policy.title}</Title>
            <p className="mt-6 max-w-[68ch] text-dim">
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

export default PrivacyPage
