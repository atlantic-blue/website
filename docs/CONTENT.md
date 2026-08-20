# Content plan

The page list for v2. Read [POSITIONING.md](./POSITIONING.md) first.

Each page below states its purpose, the call to action, the phrase it targets and the structured
data it carries. A page that cannot answer all four does not get built.

## Rules that apply to every page

- One `h1`, describing that page.
- A canonical link that points at itself.
- A share image.
- BreadcrumbList structured data.
- The contact route in the header and the footer.
- No claim without a number or a named client behind it.

## Home

Purpose: convince a broadcaster that we have fixed their problem before.
Call to action: book a call.
Phrase: streaming platform consultancy London.
Structured data: Organization, LocalBusiness, WebSite.

Opens on the buyer's fear, not on our services. The fear is a stream that drops during a live event,
a player that fails on one device family, or buffering complaints nobody owns. Names the clients in
the first screen. Carries at least three real numbers, taken from the case studies.

## Services

One page per service. Each states the problem, the work, the outcome and the next step, links to the
case study that proves it, and carries Service structured data.

- `/services/video-playback-engineering`
- `/services/adaptive-bitrate-streaming`
- `/services/content-protection-and-drm`
- `/services/advertising-integration-for-video`
- `/services/live-event-readiness`
- `/services/reliability-engineering`
- `/services/cloud-platform-engineering`

A services index page lists all seven and links to each.

## Work

Case study index at `/work`, one page per client. Each carries Article structured data.

- `/work/itv`
- `/work/sky`
- `/work/dazn`
- `/work/castlabs`
- `/work/utility-warehouse`
- `/work/plentific`
- `/work/fanalysis`

Each follows the same three part shape: the situation before, the decisions taken, the measured
outcome after. Numbers only where we can stand behind them.

## About

`/about`. Purpose: tell the buyer who turns up. Names Julian, states the experience honestly, links
to juliantellez.com.

`/how-we-work`. Purpose: remove the risk. States the process, the reporting rhythm, and what the
client owns at the end.

## Engagement and pricing

`/engagement`. Purpose: let a buyer qualify themselves without a call. Names the models (day rate,
retained, fixed scope discovery), gives a real number or range, and states what is included and what
is not. Carries FAQPage structured data, because answer engines quote that format directly.

Blocked until Julian gives the numbers.

## Contact

`/contact`. Purpose: convert. Email address, booking link and a form. Every action fires a tracked
event.

## Insights

`/insights` index and `/insights/<slug>` posts. Article structured data and a feed. The company
publishes work here. The person writes on juliantellez.com. Neither republishes the other.

Lowest priority. It matters, and it matters after the site can convert a visitor.

## Legal

`/privacy`, `/cookies`, `/accessibility`, `/terms`. Linked from the footer of every page, next to
the registered name, the company number and the registered office.

## Files at the root

- `/robots.txt`, naming the sitemap.
- `/sitemap.xml`, generated at build time with a last modified date per page.
- `/llms.txt`, describing the site for answer engines.

## Languages

The current site serves `/es`, `/fr`, `/pt` and `/ru`. All four send the canonical link of the
English page, so none of them can be indexed. There is no `hreflang` markup either.

Recommendation: English only at launch. Add one language when a real market exists for it, with
correct `hreflang` and self referencing canonical links. Spanish is the strongest candidate.

Awaiting a decision from Julian.

## Page count

About 25 pages at launch, against 29 to 302 for the competitors measured on 18 August 2026. That is
enough to compete on a narrow position. It is not enough to compete on "software development company
London", and we are not trying to.
