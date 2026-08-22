import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
    title: "Page not found",
    description: "That address does not exist on atlanticblue.solutions.",
    robots: { index: false },
}

/**
 * The old site answered HTTP 200 with the home page for every unknown address,
 * including /robots.txt and /sitemap.xml. Google reads that as a soft 404 and
 * marks the whole site down for it. This page exists so the server can answer
 * 404 and mean it.
 */
const NotFound = () => (
    <section className="mx-auto max-w-[1180px] px-3 py-12">
        <h1 className="text-[clamp(2.4rem,5.2vw,4.2rem)] leading-[1.02] tracking-[-0.035em]">
            Page not found
        </h1>
        <p className="mt-3 text-dim">
            That address does not exist.{" "}
            <Link href="/" className="text-accent">
                Go to the home page
            </Link>
            .
        </p>
    </section>
)

export default NotFound
