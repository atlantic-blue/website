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
        <body className="overflow-x-hidden">
            <a
                href="#main"
                className="absolute -left-[9999px] top-2 focus:left-4 focus:z-10 focus:bg-accent-solid focus:px-3 focus:py-2 focus:text-on-accent"
            >
                Skip to content
            </a>

            <header className="border-b border-line">
                <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
                    <Link
                        href="/"
                        className="font-display text-base font-bold tracking-[-0.02em] text-ink no-underline sm:text-[1.0625rem]"
                    >
                        Atlantic<span className="text-accent"> Blue</span>
                    </Link>
                    <nav aria-label="Main" className="flex items-center gap-5 text-[0.9375rem]">
                        {/* The text links go below the small breakpoint. Four items plus a
                            button needs about 438px, and the narrowest phone is 320. */}
                        {nav.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="hidden text-dim no-underline hover:text-ink sm:inline"
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

            <footer className="mt-16 border-t border-line bg-surface py-10 sm:mt-24">
                <div className="mx-auto grid max-w-[1180px] gap-8 px-4 sm:px-6 md:grid-cols-[1.4fr_1fr] lg:px-8">
                    <div>
                        <p className="font-display text-[1.0625rem] font-bold tracking-[-0.02em]">
                            Atlantic Blue
                        </p>
                        <p className="mt-3 text-sm">
                            <a href={`mailto:${company.email}`} className="text-accent">
                                {company.email}
                            </a>
                        </p>
                    </div>
                    <div className="text-sm leading-relaxed text-dim">
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
