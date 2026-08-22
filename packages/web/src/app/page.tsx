import type { Metadata } from "next"
import Link from "next/link"

import { clients, company } from "@/lib/site"

export const metadata: Metadata = {
    alternates: { canonical: "/" },
}

const practice = [
    {
        title: "Product engineering",
        body: "Web and mobile products, from a first version through to the thing that carries real load.",
    },
    {
        title: "Platform and cloud",
        body: "Infrastructure as code, delivery pipelines, and the unglamorous work of making a deploy boring.",
    },
    {
        title: "Reliability",
        body: "Observability, alerting and load testing, so a failure surfaces before a customer reports it.",
    },
]

const HomePage = () => (
    <>
        <section className="shell hero">
            <p className="label">London software consultancy</p>
            <h1>We build software that cannot afford to break.</h1>
            <p className="lede">
                Nine years inside broadcast and streaming platforms, where a fault is visible to
                millions of people at once. We bring that standard to whatever you are building.
            </p>
            <div className="actions">
                <a className="btn" href={`mailto:${company.email}`}>
                    Book a call
                </a>
                <Link className="btn btn-quiet" href="/">
                    See the work
                </Link>
            </div>
        </section>

        <section className="shell practice">
            <h2>What we do</h2>
            <div className="practice-grid">
                {practice.map((item) => (
                    <div key={item.title}>
                        <h3>{item.title}</h3>
                        <p>{item.body}</p>
                    </div>
                ))}
            </div>

            <div className="flagship">
                <div>
                    <p className="label">The specialism</p>
                    <h3 style={{ marginTop: "var(--s2)" }}>Video and streaming</h3>
                </div>
                <div>
                    <p>
                        Playback, adaptive bitrate delivery, content protection, advertising
                        integration and the readiness work a live event needs. It is where we
                        contract most, and it is the reason the reliability work above is not a
                        claim.
                    </p>
                </div>
            </div>
        </section>

        <section className="shell clients">
            <p className="label">Platforms we have worked inside</p>
            <ul>
                {clients.map((name) => (
                    <li key={name}>{name}</li>
                ))}
            </ul>
        </section>
    </>
)

export default HomePage
