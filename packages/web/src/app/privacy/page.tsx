import type { Metadata } from "next"

import { Section, Title } from "@/components/ui/section"
import { privacy } from "@/lib/privacy"

export const metadata: Metadata = {
    title: privacy.title,
    alternates: { canonical: "/privacy" },
}

const PrivacyPage = () => (
    <Section className="pt-12 sm:pt-20">
        <Title>{privacy.title}</Title>
    </Section>
)

export default PrivacyPage
