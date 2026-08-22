import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Eyebrow, Heading, Lede, Section, Title } from "@/components/ui/section"
import { serviceBySlug, services } from "@/lib/services"
import { company } from "@/lib/site"

interface Params {
    params: Promise<{ slug: string }>
}

export const generateStaticParams = () => services.map((service) => ({ slug: service.slug }))

export const generateMetadata = async ({ params }: Params): Promise<Metadata> => {
    const { slug } = await params
    const service = serviceBySlug(slug)
    if (!service) {
        return {}
    }

    return {
        title: service.name,
        description: service.summary,
        alternates: { canonical: `/services/${service.slug}` },
    }
}

const ServicePage = async ({ params }: Params) => {
    const { slug } = await params
    const service = serviceBySlug(slug)
    if (!service) {
        notFound()
    }

    // Service and BreadcrumbList, so a search engine or an answer engine can
    // quote this page rather than only read it.
    const structuredData = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Service",
                name: service.name,
                description: service.summary,
                serviceType: service.name,
                areaServed: "GB",
                provider: {
                    "@type": "Organization",
                    name: company.legalName,
                    url: company.origin,
                },
                url: `${company.origin}/services/${service.slug}`,
            },
            {
                "@type": "BreadcrumbList",
                itemListElement: [
                    {
                        "@type": "ListItem",
                        position: 1,
                        name: "Services",
                        item: `${company.origin}/services`,
                    },
                    {
                        "@type": "ListItem",
                        position: 2,
                        name: service.name,
                        item: `${company.origin}/services/${service.slug}`,
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
                    <Link href="/services" className="text-dim hover:text-ink">
                        Services
                    </Link>{" "}
                    / {service.name}
                </Eyebrow>
                <Title className="max-w-[18ch]">{service.name}</Title>
                <Lede className="max-w-[58ch]">{service.problem}</Lede>
            </Section>

            <Section className="border-t border-line">
                <Heading>What the engagement is</Heading>
                <ol className="mt-8 border-t border-line">
                    {service.work.map((step, index) => (
                        <li key={step} className="flex gap-4 border-b border-line py-4">
                            <span className="font-mono text-xs tabular-nums text-accent pt-1">
                                {String(index + 1).padStart(2, "0")}
                            </span>
                            <span className="max-w-[62ch]">{step}</span>
                        </li>
                    ))}
                </ol>
            </Section>

            <Section className="border-t border-line">
                <div className="grid gap-6 border border-line bg-surface p-5 sm:p-8 md:grid-cols-2">
                    <div>
                        <Eyebrow>What you are left with</Eyebrow>
                        <p className="mt-2 max-w-[46ch]">{service.outcome}</p>
                    </div>
                    <div>
                        <Eyebrow>Typical engagement</Eyebrow>
                        <p className="mt-2">{service.typical}</p>
                        <div className="mt-4">
                            <Button asChild>
                                <a href={`mailto:${company.email}`}>Book a call</a>
                            </Button>
                        </div>
                    </div>
                </div>
            </Section>
        </>
    )
}

export default ServicePage
