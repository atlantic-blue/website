import type { Metadata } from "next"
import Link from "next/link"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { footerNav } from "@/lib/nav"
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
                        {/* One link, visible at every width. Two hidden links left a
                            phone with no navigation at all, and the second of them
                            pointed at the services page while calling itself Work. */}
                        <Link href="/services" className="text-dim no-underline hover:text-ink">
                            Services
                        </Link>
                        <Button asChild>
                            <a href={`mailto:${company.email}`}>Book a call</a>
                        </Button>
                    </nav>
                </div>
            </header>

            <main id="main">{children}</main>

            <footer className="mt-16 border-t border-line bg-surface sm:mt-24">
                <div className="mx-auto max-w-[1180px] px-4 py-10 sm:px-6 lg:px-8">
                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                            <p className="font-display text-[1.0625rem] font-bold tracking-[-0.02em]">
                                Atlantic Blue
                            </p>
                            <p className="mt-3 max-w-[28ch] text-sm text-dim">
                                A London software consultancy. We build software that cannot afford
                                to break.
                            </p>
                            <p className="mt-4 text-sm">
                                <a href={`mailto:${company.email}`} className="text-accent">
                                    {company.email}
                                </a>
                            </p>
                        </div>

                        {footerNav.map((column) => (
                            <nav key={column.heading} aria-label={column.heading}>
                                <p className="font-mono text-xs uppercase tracking-[0.12em] text-dim">
                                    {column.heading}
                                </p>
                                <ul className="mt-4 flex flex-col gap-2 text-sm">
                                    {column.links.map((link) => (
                                        <li key={link.href}>
                                            <Link
                                                href={link.href}
                                                className="text-ink no-underline hover:text-accent hover:underline"
                                            >
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        ))}
                    </div>

                    <div className="mt-10 border-t border-line pt-6 text-sm leading-relaxed text-dim">
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
