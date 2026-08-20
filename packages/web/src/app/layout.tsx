import type { Metadata } from "next"
import type { ReactNode } from "react"

import { company } from "@/lib/site"

export const metadata: Metadata = {
    metadataBase: new URL(company.origin),
    title: {
        default: company.tradingName,
        template: `%s | ${company.tradingName}`,
    },
    description:
        "A London consultancy for broadcasters and streamers. Video playback, streaming delivery and the reliability work that keeps a service on air.",
}

const RootLayout = ({ children }: { children: ReactNode }) => (
    <html lang="en">
        <body>
            <a href="#main">Skip to content</a>
            <main id="main">{children}</main>
            <footer>
                <p>
                    {company.legalName}. Company number {company.companyNumber}. Registered office:{" "}
                    {company.registeredOffice.join(", ")}.
                </p>
                <p>
                    <a href={`mailto:${company.email}`}>{company.email}</a>
                </p>
            </footer>
        </body>
    </html>
)

export default RootLayout
