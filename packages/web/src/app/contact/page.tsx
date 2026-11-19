import type { Metadata } from "next"

import { ContactForm } from "@/components/contact-form"
import { Eyebrow, Lede, Section, Title } from "@/components/ui/section"
import { company } from "@/lib/site"

const path = "/contact"

export const metadata: Metadata = {
    title: "Contact",
    description:
        "Tell us what is breaking. Write what the system does now, and what it must do instead, and we reply by email.",
    alternates: { canonical: path },
}

const ContactPage = () => (
    <>
        <Section className="pt-12 sm:pt-20">
            <Eyebrow>Contact</Eyebrow>
            <Title className="max-w-[18ch]">Tell us what is breaking</Title>
            <Lede>Write what the system does now, and what it must do instead.</Lede>
        </Section>

        <Section className="border-t border-line">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,640px)_minmax(0,1fr)] lg:gap-16">
                <ContactForm pagePath={path} />
                <aside>
                    <Eyebrow>Or email us</Eyebrow>
                    <p className="mt-4">
                        <a
                            href={`mailto:${company.email}`}
                            className="break-words text-accent underline decoration-line underline-offset-4 hover:decoration-accent"
                        >
                            {company.email}
                        </a>
                    </p>
                </aside>
            </div>
        </Section>
    </>
)

export default ContactPage
