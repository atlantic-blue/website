import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { Button } from "@/components/ui/button"
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

            <section className="mx-auto max-w-[1180px] px-3 pt-12 pb-8">
                <p className="font-mono text-xs uppercase tracking-[0.12em] text-dim">
                    <Link href="/services" className="text-dim hover:text-ink">
                        Services
                    </Link>{" "}
                    / {service.name}
                </p>
                <h1 className="mt-3 max-w-[18ch] text-[clamp(2.4rem,5.2vw,4.2rem)] leading-[1.02] tracking-[-0.035em]">
                    {service.name}
                </h1>
                <p className="mt-3 max-w-[58ch] text-lg text-dim">{service.problem}</p>
            </section>

            <section className="mx-auto max-w-[1180px] border-t border-line px-3 py-8">
                <h2 className="text-[clamp(1.75rem,3vw,2.4rem)] leading-[1.08] tracking-[-0.025em]">
                    What the engagement is
                </h2>
                <ol className="mt-5 border-t border-line">
                    {service.work.map((step, index) => (
                        <li key={step} className="flex gap-3 border-b border-line py-3">
                            <span className="font-mono text-xs tabular-nums text-accent pt-1">
                                {String(index + 1).padStart(2, "0")}
                            </span>
                            <span className="max-w-[62ch]">{step}</span>
                        </li>
                    ))}
                </ol>
            </section>

            <section className="mx-auto max-w-[1180px] border-t border-line px-3 py-8">
                <div className="grid gap-5 border border-line bg-surface p-5 md:grid-cols-2 md:gap-8">
                    <div>
                        <p className="font-mono text-xs uppercase tracking-[0.12em] text-dim">
                            What you are left with
                        </p>
                        <p className="mt-2 max-w-[46ch]">{service.outcome}</p>
                    </div>
                    <div>
                        <p className="font-mono text-xs uppercase tracking-[0.12em] text-dim">
                            Typical engagement
                        </p>
                        <p className="mt-2">{service.typical}</p>
                        <div className="mt-4">
                            <Button asChild>
                                <a href={`mailto:${company.email}`}>Book a call</a>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default ServicePage
