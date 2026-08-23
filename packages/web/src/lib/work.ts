/**
 * The work pages.
 *
 * These are deliberately not conventional case studies. A conventional one leads
 * with the client's numbers, and those are the client's to publish, not ours.
 * See DESIGN.md, "Confidentiality".
 *
 * So each page leads with the shape of the problem instead: what goes wrong in
 * that kind of platform, how it is found, and what the fix looks like. The
 * client is named as where the work happened, and nothing about their system,
 * their metrics or their roadmap appears.
 *
 * That is weaker than a case study with a number in it, and it is the honest
 * version until a client agrees to be quoted.
 */
export interface Engagement {
    readonly slug: string
    readonly client: string
    /** What the client does, in one line a stranger would recognise. */
    readonly sector: string
    readonly period: string
    /** The headline: the problem, not the client. */
    readonly title: string
    readonly summary: string
    /** Three or four paragraphs. The shape of the problem and the work. */
    readonly body: readonly string[]
    readonly stack: readonly string[]
    /** Slugs from services.ts. */
    readonly services: readonly string[]
}

export const engagements: readonly Engagement[] = [
    {
        slug: "itv",
        client: "ITV",
        sector: "The largest commercial television network in the United Kingdom",
        period: "Since March 2025",
        title: "A player that has to work on every screen in the country",
        summary:
            "Playback engineering for a national broadcaster, across the whole spread of devices its audience actually owns.",
        body: [
            "A national broadcaster does not get to choose its audience's hardware. The same stream has to play on a current phone, a television bought eight years ago, a games console and a set top box, and each of those has a different media stack underneath it with different bugs in it.",
            "Most of the difficulty is not in the common case. It is in the long tail: the device family where the picture is soft, the one where an advert stalls, the one where playback recovers from a network drop everywhere except there. None of it raises an error, so none of it appears in a dashboard. It appears as people leaving.",
            "The work is playback engineering across that spread. Reproducing a fault on the device it happens on rather than on a laptop, working through the player rather than around it, and leaving the measurement behind so the next regression is caught before release rather than after.",
        ],
        stack: ["TypeScript", "React", "MPEG-DASH", "HLS", "Webpack", "Jest", "Cypress"],
        services: ["video-playback-engineering", "advertising-integration", "live-event-readiness"],
    },
    {
        slug: "castlabs",
        client: "castLabs",
        sector: "Secure video delivery: content protection and cross platform player software",
        period: "September 2024 to March 2025",
        title: "Advertising that has to arrive without breaking the stream",
        summary:
            "Research and prototyping on how adverts are placed into live and on demand video without stalling playback.",
        body: [
            "Putting an advert into a video stream is harder than it looks. Insert it in the browser and it is easy to block and easy to stall. Insert it further back, in the manifest the player reads, and the revenue is protected but a bad join becomes a black frame that nobody can reproduce.",
            "The standards for doing it properly are young and they differ between the two formats the industry actually uses. What works on one device family does not always work on another, and the difference only shows up on real hardware.",
            "The work was prototyping and evaluating those approaches for both live and on demand, on the devices they have to survive, so a product decision could be made on evidence rather than on a specification.",
        ],
        stack: ["TypeScript", "React", "MPEG-DASH", "Apple HLS", "Webpack", "Jest"],
        services: ["advertising-integration", "content-protection"],
    },
    {
        slug: "sky",
        client: "Sky",
        sector: "A leading British broadcaster and telecommunications company",
        period: "January 2023 to September 2024",
        title: "Buffering is a decision the player made",
        summary:
            "Adaptive bitrate work: how a player estimates the network it is on, and what it does when the estimate is wrong.",
        body: [
            "A player picks a quality level every few seconds, based on a guess about how much bandwidth it has. Guess high and the buffer empties and the viewer sees a spinner. Guess low and the picture is soft on a connection that could have carried more. Neither is an error, so neither is in the error rate.",
            "The guess is the whole game, and it is made harder by everything real networks do: a congested cell, a shared line at eight in the evening, a router that buffers. An algorithm tuned on a clean connection behaves badly on a real one.",
            "The work was on that estimate and on what the player does around it, on the browsers where the media stack behaves least predictably.",
        ],
        stack: ["TypeScript", "React", "Sass", "Node.js", "Selenium", "Webpack"],
        services: ["adaptive-bitrate-streaming", "video-playback-engineering"],
    },
    {
        slug: "dazn",
        client: "DAZN",
        sector: "Live and on demand sports streaming",
        period: "September 2017 to December 2019",
        title: "Live sport, on every device, at the same moment",
        summary:
            "Playback across consoles, set top boxes, televisions and web, plus the delivery and measurement behind it.",
        body: [
            "Live sport is the hardest shape of streaming traffic there is. Nobody joins gradually. Everyone arrives at kick off, on whatever they own, and anything that breaks breaks in front of the whole audience at once.",
            "That puts pressure in two places at the same time. The player has to behave on a device matrix nobody would choose, and the delivery behind it has to absorb a join that looks nothing like a load test average.",
            "The work spanned both: video players across that matrix, and the delivery and playback measurement that tells you which of the two is actually failing.",
        ],
        stack: ["TypeScript", "React", "RxJS", "Node.js", "Go", "Docker", "Terraform"],
        services: ["video-playback-engineering", "live-event-readiness"],
    },
    {
        slug: "utility-warehouse",
        client: "Utility Warehouse",
        sector: "A multi service provider bundling home services into one bill",
        period: "December 2019 to December 2022",
        title: "Systems that tell you they are failing",
        summary:
            "Real time customer services on a container platform, and the observability that made their failures visible.",
        body: [
            "A company that bills for several services at once has a lot of moving parts talking to each other, and a customer who does not care which one broke. Email, chat, calls, reminders and payments all have to work, and a fault in any of them looks the same from outside.",
            "The interesting problem is not building them. It is knowing, at two in the morning, which one is failing and why, without reading five dashboards that were built by different teams for different reasons.",
            "The work was building those services on a container platform and instrumenting them so a failure surfaces before a customer reports it.",
        ],
        stack: [
            "TypeScript",
            "React",
            "GraphQL",
            "Go",
            "Kubernetes",
            "Kafka",
            "Prometheus",
            "Grafana",
            "Terraform",
        ],
        services: ["reliability-engineering", "platform-and-cloud", "product-engineering"],
    },
    {
        slug: "plentific",
        client: "Plentific",
        sector: "A property management platform",
        period: "October 2015 to September 2017",
        title: "A product, then the systems a product needs",
        summary:
            "Landing pages, a communications service and a business dashboard with payments, on one platform.",
        body: [
            "A marketplace has two audiences with almost nothing in common. One arrives from a search result and decides in seconds whether to stay. The other logs in every day to do their job and needs the software to get out of the way.",
            "Those pull in opposite directions. The first wants pages that render instantly on a cold connection. The second wants an application dense enough to run a business from.",
            "The work covered both ends, plus the communications and payments underneath, which is where a marketplace either earns trust or loses it.",
        ],
        stack: ["React", "Redux", "Node.js", "Sass", "Docker", "Kubernetes", "Jenkins"],
        services: ["product-engineering", "platform-and-cloud"],
    },
]

export const engagementBySlug = (slug: string): Engagement | undefined =>
    engagements.find((engagement) => engagement.slug === slug)
