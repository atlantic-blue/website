import type { Metadata } from "next"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Eyebrow, Heading, Lede, Section, Title } from "@/components/ui/section"
import { servicesInGroup } from "@/lib/services"
import { clients, company } from "@/lib/site"

export const metadata: Metadata = {
    alternates: { canonical: "/" },
}

const ServiceList = ({ group }: { group: "specialism" | "practice" }) => (
    <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {servicesInGroup(group).map((service) => (
            <li key={service.slug}>
                <h3 className="text-lg font-semibold tracking-[-0.01em] sm:text-xl">
                    <Link href={`/services/${service.slug}`} className="text-ink">
                        {service.name}
                    </Link>
                </h3>
                <p className="mt-2 text-[0.9375rem] text-dim">{service.summary}</p>
            </li>
        ))}
    </ul>
)

const HomePage = () => (
    <>
        <Section className="pt-12 sm:pt-20">
            <Eyebrow>London software consultancy</Eyebrow>
            <Title className="max-w-[16ch]">We build software that cannot afford to break.</Title>
            <Lede>
                Nine years inside broadcast and streaming platforms, where a fault is visible to
                millions of people at once. We bring that standard to whatever you are building.
            </Lede>
            <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild>
                    <a href={`mailto:${company.email}`}>Book a call</a>
                </Button>
                <Button asChild variant="quiet">
                    <Link href="/services">See what we do</Link>
                </Button>
            </div>
        </Section>

        <Section className="border-t border-line">
            <Eyebrow>The specialism</Eyebrow>
            <Heading className="mt-3">Broadcast and streaming</Heading>
            <p className="mt-4 max-w-[60ch] text-dim">
                Where we contract most, and the reason the reliability work below is not a claim. A
                fault on a streaming platform is visible to millions of people at once, so it gets
                found and fixed to a standard most systems never need.
            </p>
            <ServiceList group="specialism" />
        </Section>

        <Section className="border-t border-line">
            <Eyebrow>The practice</Eyebrow>
            <Heading className="mt-3">What we build once we are in the building</Heading>
            <ServiceList group="practice" />
        </Section>

        <Section className="border-t border-line py-8 sm:py-10">
            <Eyebrow>Platforms we have worked inside</Eyebrow>
            <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 font-display text-base font-bold text-dim sm:text-lg">
                {clients.map((name) => (
                    <li key={name}>{name}</li>
                ))}
            </ul>
        </Section>

        <Section className="border-t border-line">
            <Heading>Have something that cannot go down?</Heading>
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

export default HomePage
