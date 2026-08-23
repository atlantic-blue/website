import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Eyebrow, Heading, Lede, Section, Title } from "@/components/ui/section"
import { serviceBySlug } from "@/lib/services"
import { company } from "@/lib/site"
import { engagementBySlug, engagements } from "@/lib/work"

interface Params {
    params: Promise<{ slug: string }>
}

export const generateStaticParams = () =>
    engagements.map((engagement) => ({ slug: engagement.slug }))

export const generateMetadata = async ({ params }: Params): Promise<Metadata> => {
    const { slug } = await params
    const engagement = engagementBySlug(slug)
    if (!engagement) {
        return {}
    }

    return {
        title: `${engagement.client}: ${engagement.title}`,
        description: engagement.summary,
        alternates: { canonical: `/work/${engagement.slug}` },
    }
}

const WorkDetailPage = async ({ params }: Params) => {
    const { slug } = await params
    const engagement = engagementBySlug(slug)
    if (!engagement) {
        notFound()
    }

    const structuredData = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Article",
                headline: engagement.title,
                description: engagement.summary,
                about: engagement.client,
                author: { "@type": "Organization", name: company.legalName, url: company.origin },
                publisher: {
                    "@type": "Organization",
                    name: company.legalName,
                    url: company.origin,
                },
                url: `${company.origin}/work/${engagement.slug}`,
            },
            {
                "@type": "BreadcrumbList",
                itemListElement: [
                    {
                        "@type": "ListItem",
                        position: 1,
                        name: "Work",
                        item: `${company.origin}/work`,
                    },
                    {
                        "@type": "ListItem",
                        position: 2,
                        name: engagement.client,
                        item: `${company.origin}/work/${engagement.slug}`,
                    },
                ],
            },
        ],
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />

            <Section className="pt-12 sm:pt-20">
                <Eyebrow>
                    <Link href="/work" className="text-dim hover:text-ink">
                        Work
                    </Link>{" "}
                    / {engagement.client}
                </Eyebrow>
                <Title className="max-w-[20ch]">{engagement.title}</Title>
                <Lede className="max-w-[58ch]">{engagement.summary}</Lede>
                <dl className="mt-8 grid gap-4 border-t border-line pt-6 sm:grid-cols-3">
                    <div>
                        <dt className="font-mono text-xs uppercase tracking-[0.12em] text-dim">
                            Client
                        </dt>
                        <dd className="mt-1">{engagement.client}</dd>
                    </div>
                    <div>
                        <dt className="font-mono text-xs uppercase tracking-[0.12em] text-dim">
                            Sector
                        </dt>
                        <dd className="mt-1">{engagement.sector}</dd>
                    </div>
                    <div>
                        <dt className="font-mono text-xs uppercase tracking-[0.12em] text-dim">
                            Period
                        </dt>
                        <dd className="mt-1">{engagement.period}</dd>
                    </div>
                </dl>
            </Section>

            <Section className="border-t border-line">
                <Heading>The problem</Heading>
                <div className="mt-6 flex flex-col gap-4">
                    {engagement.body.map((paragraph) => (
                        <p key={paragraph.slice(0, 24)} className="max-w-[62ch] text-dim">
                            {paragraph}
                        </p>
                    ))}
                </div>
            </Section>

            <Section className="border-t border-line">
                <div className="grid gap-8 md:grid-cols-2">
                    <div>
                        <Eyebrow>What this touches</Eyebrow>
                        <ul className="mt-4 flex flex-col gap-2">
                            {engagement.services
                                .map((serviceSlug) => serviceBySlug(serviceSlug))
                                .filter((service) => service !== undefined)
                                .map((service) => (
                                    <li key={service.slug}>
                                        <Link
                                            href={`/services/${service.slug}`}
                                            className="text-accent underline decoration-line underline-offset-4 hover:decoration-accent"
                                        >
                                            {service.name}
                                        </Link>
                                    </li>
                                ))}
                        </ul>
                    </div>
                    <div>
                        <Eyebrow>Worked with</Eyebrow>
                        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 font-mono text-sm text-dim">
                            {engagement.stack.map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </Section>

            <Section className="border-t border-line">
                <Heading>Have the same problem?</Heading>
                <p className="mt-4 max-w-[52ch] text-dim">
                    Tell us what it is and what is worrying you about it. If it is not something we
                    should take, we will say so.
                </p>
                <div className="mt-8">
                    <Button asChild>
                        <a href={`mailto:${company.email}`}>Book a call</a>
                    </Button>
                </div>
            </Section>
        </>
    )
}

export default WorkDetailPage
