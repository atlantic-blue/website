import type { Metadata } from "next"
import Link from "next/link"
import type { ReactNode } from "react"

import { company } from "@/lib/site"

import "@/styles/globals.css"

export const metadata: Metadata = {
    metadataBase: new URL(company.origin),
    title: {
        default: `${company.tradingName} | Software consultancy, London`,
        template: `%s | ${company.tradingName}`,
    },
    description:
        "A London software consultancy. We build and repair systems that cannot afford to break, with nine years inside broadcast and streaming platforms behind it.",
}

const nav = [
    { href: "/", label: "Services" },
    { href: "/", label: "Work" },
    { href: "/", label: "How we work" },
]

const RootLayout = ({ children }: { children: ReactNode }) => (
    <html lang="en">
        <body>
            <a className="skip" href="#main">
                Skip to content
            </a>

            <header className="masthead">
                <div className="shell">
                    <Link className="wordmark" href="/">
                        Atlantic<span> Blue</span>
                    </Link>
                    <nav aria-label="Main">
                        {nav.map((item) => (
                            <Link key={item.label} href={item.href}>
                                {item.label}
                            </Link>
                        ))}
                        <a className="btn" href={`mailto:${company.email}`}>
                            Book a call
                        </a>
                    </nav>
                </div>
            </header>

            <main id="main">{children}</main>

            <footer className="foot">
                <div className="shell foot-grid">
                    <div>
                        <p className="wordmark">Atlantic Blue</p>
                        <p className="legal" style={{ marginTop: "var(--s3)" }}>
                            <a href={`mailto:${company.email}`}>{company.email}</a>
                        </p>
                    </div>
                    <div className="legal">
                        <p className="legal">{company.legalName}</p>
                        <p className="legal">
                            Registered in England and Wales, company number{" "}
                            <span className="tnum">{company.companyNumber}</span>.
                        </p>
                        <address>{company.registeredOffice.join(", ")}</address>
                    </div>
                </div>
            </footer>
        </body>
    </html>
)

export default RootLayout
