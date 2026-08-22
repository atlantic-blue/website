import type { Metadata } from "next"
import Link from "next/link"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
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
    { href: "/services", label: "Services" },
    { href: "/services", label: "Work" },
]

const RootLayout = ({ children }: { children: ReactNode }) => (
    <html lang="en">
        <body>
            <a
                href="#main"
                className="absolute -left-[9999px] top-2 focus:left-4 focus:z-10 focus:bg-accent-solid focus:text-on-accent focus:px-2 focus:py-1"
            >
                Skip to content
            </a>

            <header className="border-b border-line">
                <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-3 px-3 py-2">
                    <Link
                        href="/"
                        className="font-display text-[1.0625rem] font-bold tracking-[-0.02em] text-ink no-underline"
                    >
                        Atlantic<span className="text-accent"> Blue</span>
                    </Link>
                    <nav aria-label="Main" className="flex items-center gap-3 text-[0.9375rem]">
                        {nav.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="text-dim no-underline hover:text-ink"
                            >
                                {item.label}
                            </Link>
                        ))}
                        <Button asChild>
                            <a href={`mailto:${company.email}`}>Book a call</a>
                        </Button>
                    </nav>
                </div>
            </header>

            <main id="main">{children}</main>

            <footer className="mt-12 border-t border-line bg-surface py-5">
                <div className="mx-auto grid max-w-[1180px] gap-3 px-3 md:grid-cols-[1.4fr_1fr] md:gap-8">
                    <div>
                        <p className="font-display text-[1.0625rem] font-bold tracking-[-0.02em]">
                            Atlantic Blue
                        </p>
                        <p className="mt-2 text-[0.8125rem]">
                            <a href={`mailto:${company.email}`} className="text-accent">
                                {company.email}
                            </a>
                        </p>
                    </div>
                    <div className="text-[0.8125rem] leading-[1.7] text-dim">
                        <p>{company.legalName}</p>
                        <p>
                            Registered in England and Wales, company number{" "}
                            <span className="tabular-nums">{company.companyNumber}</span>.
                        </p>
                        <address className="not-italic">
                            {company.registeredOffice.join(", ")}
                        </address>
                    </div>
                </div>
            </footer>
        </body>
    </html>
)

export default RootLayout
