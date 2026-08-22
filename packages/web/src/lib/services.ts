/**
 * One page per service, because one page cannot rank for more than one intent.
 *
 * The set is split deliberately. The practice is what we deliver and what we
 * hire into. The specialism is how we get in the door: it is the work almost
 * nobody else can claim, and it is what a broadcaster searches for.
 *
 * No client attributed number appears here. See DESIGN.md, "Confidentiality".
 */
export type ServiceGroup = "practice" | "specialism"

export interface Service {
    readonly slug: string
    readonly name: string
    readonly group: ServiceGroup
    /** Used as the meta description and the index card. One sentence. */
    readonly summary: string
    /** The buyer's problem, in their words, before we arrive. */
    readonly problem: string
    /** What the engagement actually consists of. */
    readonly work: readonly string[]
    /** What the client is left holding afterwards. */
    readonly outcome: string
    readonly typical: string
}

export const services: readonly Service[] = [
    {
        slug: "video-playback-engineering",
        name: "Video playback engineering",
        group: "specialism",
        summary:
            "Players that work on the devices your audience actually owns, including the awkward ones.",
        problem:
            "Playback fails on one family of devices and nobody on the team owns the player. The bug reports are unreproducible on a laptop, the vendor says it works for them, and the long tail of set top boxes and televisions is where the complaints come from.",
        work: [
            "Reproduce the fault on the device family it happens on, not on a desktop browser.",
            "Work through the player itself: manifest handling, media source buffering, error recovery.",
            "Split the bundle so a constrained device is not paying for code it cannot run.",
            "Leave a device matrix behind, so the next regression is caught before release.",
        ],
        outcome:
            "Playback that behaves the same on the devices your audience owns, and a team that can keep it that way.",
        typical: "Four to eight weeks, embedded in your platform team.",
    },
    {
        slug: "adaptive-bitrate-streaming",
        name: "Adaptive bitrate streaming",
        group: "specialism",
        summary:
            "Buffering, rendition flapping and a slow first frame, treated as the bugs they are.",
        problem:
            "An adaptive bitrate ladder picks a rendition every few seconds from an estimate of the available bandwidth. When the estimate is wrong the viewer sees a spinner, or a soft picture, and neither raises an error. It shows up as people leaving.",
        work: [
            "Measure what the player does: rendition switches, buffer occupancy, time to first frame.",
            "Tune the bandwidth estimate and the request pattern that feeds it.",
            "Rework buffer management so it survives a congested network rather than assuming a clean one.",
            "Put the measurement in your dashboards, not in a report.",
        ],
        outcome: "Fewer stalls, a faster first frame, and a number you can watch afterwards.",
        typical: "Four to eight weeks.",
    },
    {
        slug: "content-protection",
        name: "Content protection",
        group: "specialism",
        summary: "Digital rights management that protects the content without breaking playback.",
        problem:
            "Rights holders require protection, and every layer of it is another thing that can fail between the licence server and the screen. Failures cluster on the oldest devices, which are the ones least able to tell you why.",
        work: [
            "Work through licence acquisition, key rotation and the failure paths around them.",
            "Test across the protection systems your device matrix actually needs.",
            "Separate a genuine rights failure from a playback bug wearing its clothes.",
        ],
        outcome:
            "Protection that satisfies the rights holder and is invisible to everybody watching.",
        typical: "Three to six weeks.",
    },
    {
        slug: "advertising-integration",
        name: "Advertising integration for video",
        group: "specialism",
        summary: "Adverts that play without stalling the stream or leaking the revenue.",
        problem:
            "Advertising is where playback breaks and where revenue quietly disappears. Client side insertion is easy to block and easy to stall. Server side insertion protects the revenue and moves the problem into the manifest, where a bad splice becomes a black frame nobody can reproduce.",
        work: [
            "Work through the insertion path end to end, from the decision call to the frame on screen.",
            "Find the splices that fail, on the devices they fail on.",
            "Weigh client side against server side insertion for your platform rather than in general.",
        ],
        outcome: "Advertising that plays, and a revenue number that is not leaking.",
        typical: "Six to ten weeks.",
    },
    {
        slug: "live-event-readiness",
        name: "Live event readiness",
        group: "specialism",
        summary: "The audience arrives in ninety seconds, not over a morning. Be ready for that.",
        problem:
            "A live event does not ramp. Everyone joins at kick off, the origin sees a request pattern it has never seen in a load test, and whatever breaks breaks in front of the whole audience at once. Preparing for that is a different exercise from scaling a catalogue service.",
        work: [
            "Model the join, not the average, at the concurrency the event will really reach.",
            "Find the single points before the day. Manifest generation, licence issuance and the advertising call are the three that usually bite.",
            "Decide the degradations in advance: what is shed first, who can shed it, what the viewer sees.",
            "Be on the event with you, reading the same dashboards as your team.",
        ],
        outcome:
            "A platform that has already survived the shape of the traffic, and a plan for the day.",
        typical: "Six to twelve weeks, ending on the event.",
    },
    {
        slug: "product-engineering",
        name: "Product engineering",
        group: "practice",
        summary:
            "Web and mobile products, from a first version to the thing that carries real load.",
        problem:
            "You have something to build and no team to build it, or a team that is already full. The risk is not writing the code, it is the six months afterwards when whoever wrote it has gone.",
        work: [
            "Build the thing, in your repository, with your review process.",
            "Ship in slices that can be released and reverted independently.",
            "Write the tests alongside the code, not as a follow up.",
            "Hand over with the documentation a new joiner would need.",
        ],
        outcome: "Working software your own team can carry on with.",
        typical: "Eight weeks upwards.",
    },
    {
        slug: "platform-and-cloud",
        name: "Platform and cloud",
        group: "practice",
        summary: "Infrastructure as code, delivery pipelines, and making a deploy boring.",
        problem:
            "Deploys are a thing people schedule around. Infrastructure changes are applied by hand, by whoever knows how, and nobody is certain what is running in production.",
        work: [
            "Put the infrastructure in code and the code in the pipeline.",
            "Make a deploy something that happens on merge, with a check that the deployed thing works.",
            "Close the obvious gaps first: access, secrets, and anything applied from a laptop.",
        ],
        outcome: "A deploy nobody schedules around, and infrastructure you can read.",
        typical: "Four to ten weeks.",
    },
    {
        slug: "reliability-engineering",
        name: "Reliability engineering",
        group: "practice",
        summary:
            "Observability, alerting and load testing, so failures surface before customers find them.",
        problem:
            "You find out from customers. The dashboards are full and none of them answer the question you have at two in the morning, and the alerts have been muted because they fire when nothing is wrong.",
        work: [
            "Instrument the paths that matter to the business, not everything that is easy to measure.",
            "Rewrite alerts so each one says what is failing, where, and what to do about it.",
            "Load test the shape of your real traffic rather than a flat average.",
        ],
        outcome: "Failures you hear about first, and alerts your team trusts enough to leave on.",
        typical: "Four to eight weeks.",
    },
]

export const serviceBySlug = (slug: string): Service | undefined =>
    services.find((service) => service.slug === slug)

export const servicesInGroup = (group: ServiceGroup): readonly Service[] =>
    services.filter((service) => service.group === group)
