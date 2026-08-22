import type { Metadata } from "next"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { servicesInGroup } from "@/lib/services"
import { clients, company } from "@/lib/site"

export const metadata: Metadata = {
    alternates: { canonical: "/" },
}

const HomePage = () => (
    <>
        <section className="mx-auto max-w-[1180px] px-3 pt-12 pb-8">
            <p className="font-mono text-xs uppercase tracking-[0.12em] text-dim">
                London software consultancy
            </p>
            <h1 className="mt-3 max-w-[16ch] text-[clamp(2.4rem,5.2vw,4.2rem)] leading-[1.02] tracking-[-0.035em]">
                We build software that cannot afford to break.
            </h1>
            <p className="mt-3 max-w-[52ch] text-lg text-dim">
                Nine years inside broadcast and streaming platforms, where a fault is visible to
                millions of people at once. We bring that standard to whatever you are building.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
                <Button asChild>
                    <a href={`mailto:${company.email}`}>Book a call</a>
                </Button>
                <Button asChild variant="quiet">
                    <Link href="/services">See what we do</Link>
                </Button>
            </div>
        </section>

        <section className="mx-auto max-w-[1180px] border-t border-line px-3 py-8">
            <p className="font-mono text-xs uppercase tracking-[0.12em] text-dim">The specialism</p>
            <h2 className="mt-2 text-[clamp(1.75rem,3vw,2.4rem)] leading-[1.08] tracking-[-0.025em]">
                Broadcast and streaming
            </h2>
            <p className="mt-3 max-w-[60ch] text-dim">
                Where we contract most, and the reason the reliability work below is not a claim. A
                fault on a streaming platform is visible to millions of people at once, so it gets
                found and fixed to a standard most systems never need.
            </p>
            <ul className="mt-5 grid gap-5 md:grid-cols-3">
                {servicesInGroup("specialism").map((service) => (
                    <li key={service.slug}>
                        <h3 className="text-xl font-semibold tracking-[-0.01em]">
                            <Link href={`/services/${service.slug}`} className="text-ink">
                                {service.name}
                            </Link>
                        </h3>
                        <p className="mt-1 text-[0.9375rem] text-dim">{service.summary}</p>
                    </li>
                ))}
            </ul>
        </section>

        <section className="mx-auto max-w-[1180px] border-t border-line px-3 py-8">
            <p className="font-mono text-xs uppercase tracking-[0.12em] text-dim">The practice</p>
            <h2 className="mt-2 text-[clamp(1.75rem,3vw,2.4rem)] leading-[1.08] tracking-[-0.025em]">
                What we build once we are in the building
            </h2>
            <ul className="mt-5 grid gap-5 md:grid-cols-3">
                {servicesInGroup("practice").map((service) => (
                    <li key={service.slug}>
                        <h3 className="text-xl font-semibold tracking-[-0.01em]">
                            <Link href={`/services/${service.slug}`} className="text-ink">
                                {service.name}
                            </Link>
                        </h3>
                        <p className="mt-1 text-[0.9375rem] text-dim">{service.summary}</p>
                    </li>
                ))}
            </ul>
        </section>

        <section className="mx-auto max-w-[1180px] border-t border-line px-3 py-6">
            <p className="font-mono text-xs uppercase tracking-[0.12em] text-dim">
                Platforms we have worked inside
            </p>
            <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 font-display text-lg font-bold text-dim">
                {clients.map((name) => (
                    <li key={name}>{name}</li>
                ))}
            </ul>
        </section>

        <section className="mx-auto max-w-[1180px] border-t border-line px-3 py-8">
            <h2 className="text-[clamp(1.75rem,3vw,2.4rem)] leading-[1.08] tracking-[-0.025em]">
                Have something that cannot go down?
            </h2>
            <p className="mt-3 max-w-[52ch] text-dim">
                Tell us what it is and what is worrying you about it. If it is not something we
                should take, we will say so.
            </p>
            <div className="mt-5">
                <Button asChild>
                    <a href={`mailto:${company.email}`}>Book a call</a>
                </Button>
            </div>
        </section>
    </>
)

export default HomePage
