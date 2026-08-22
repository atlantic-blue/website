import type { Metadata } from "next"

import { company } from "@/lib/site"

export const metadata: Metadata = {
    alternates: { canonical: "/" },
}

const HomePage = () => (
    <>
        <h1>{company.tradingName}</h1>
        <p>
            A London consultancy for broadcasters and streamers. Video playback, streaming delivery
            and the reliability work that keeps a service on air.
        </p>
    </>
)

export default HomePage
