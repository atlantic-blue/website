import type { Metadata } from "next"
import Link from "next/link"

import { Eyebrow, Lede, Section, Title } from "@/components/ui/section"
import { servicesInGroup } from "@/lib/services"

export const metadata: Metadata = {
    title: "Services",
    description:
        "Video playback, adaptive bitrate streaming, content protection, advertising integration and live event readiness, plus product, platform and reliability engineering.",
    alternates: { canonical: "/services" },
}

const groups = [
    {
        key: "specialism" as const,
        label: "The specialism",
        note: "Broadcast and streaming. Where we contract most, and where the reliability work below stops being a claim.",
    },
    {
        key: "practice" as const,
        label: "The practice",
        note: "What we build once we are in the building.",
    },
]

const ServicesPage = () => (
    <>
        <Section className="pt-12 sm:pt-20">
            <Eyebrow>Services</Eyebrow>
            <Title>What we do</Title>
            <Lede>
                One page for each, because the problems are not interchangeable and neither are the
                people who have them.
            </Lede>
        </Section>

        {groups.map((group) => (
            <Section key={group.key} className="border-t border-line">
                <Eyebrow>{group.label}</Eyebrow>
                <p className="mt-3 max-w-[60ch] text-dim">{group.note}</p>
                <ul className="mt-8 grid gap-6 md:grid-cols-2">
                    {servicesInGroup(group.key).map((service) => (
                        <li key={service.slug} className="border border-line bg-surface p-5 sm:p-6">
                            <h2 className="text-lg font-semibold tracking-[-0.01em] sm:text-xl">
                                <Link href={`/services/${service.slug}`} className="text-ink">
                                    {service.name}
                                </Link>
                            </h2>
                            <p className="mt-3 text-[0.9375rem] text-dim">{service.summary}</p>
                        </li>
                    ))}
                </ul>
            </Section>
        ))}
    </>
)

export default ServicesPage
