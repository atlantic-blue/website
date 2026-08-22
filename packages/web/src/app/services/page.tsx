import type { Metadata } from "next"
import Link from "next/link"

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
        <section className="mx-auto max-w-[1180px] px-3 pt-12 pb-8">
            <p className="font-mono text-xs uppercase tracking-[0.12em] text-dim">Services</p>
            <h1 className="mt-3 text-[clamp(2.4rem,5.2vw,4.2rem)] leading-[1.02] tracking-[-0.035em]">
                What we do
            </h1>
            <p className="mt-3 max-w-[52ch] text-lg text-dim">
                One page for each, because the problems are not interchangeable and neither are the
                people who have them.
            </p>
        </section>

        {groups.map((group) => (
            <section
                key={group.key}
                className="mx-auto max-w-[1180px] border-t border-line px-3 py-8"
            >
                <p className="font-mono text-xs uppercase tracking-[0.12em] text-dim">
                    {group.label}
                </p>
                <p className="mt-2 max-w-[60ch] text-dim">{group.note}</p>
                <ul className="mt-5 grid gap-5 md:grid-cols-2">
                    {servicesInGroup(group.key).map((service) => (
                        <li key={service.slug} className="border border-line bg-surface p-4">
                            <h2 className="text-xl font-semibold tracking-[-0.01em]">
                                <Link href={`/services/${service.slug}`} className="text-ink">
                                    {service.name}
                                </Link>
                            </h2>
                            <p className="mt-2 text-[0.9375rem] text-dim">{service.summary}</p>
                        </li>
                    ))}
                </ul>
            </section>
        ))}
    </>
)

export default ServicesPage
