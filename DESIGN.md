# Design

The system every page inherits. Change it here, not in a component.

## What the site is selling

Atlantic Blue is a London software consultancy. Broadcast and streaming is the credential, not the
whole offer: a fault on a streaming platform is visible to millions of people at once, and building
to that standard is what we sell to everybody else. The design has to carry both. Specialist enough
to be believed by an engineering manager at a broadcaster, broad enough that a consultancy which
hires more people is not contradicting its own home page.

## Confidentiality

No client attributed number goes on this site. Name the client, describe the kind of work, stop.
Anything specific about a client's system, their metrics or their roadmap is theirs, not ours.

Any chart or graph must plot real values. A decorative chart on a site selling reliability is the
fastest way to lose the reader who matters.

## Colour

Dark is the primary theme. Light is defined and supported, not an afterthought.

Dark:

    ground            #0B0D10
    surface           #12151A
    raised            #171B21
    line              #232A33
    ink               #E4EAF0
    dim               #8D9BA9
    accent            #3BB4E5   text and links
    accent-solid      #0092CA   filled buttons
    on-accent-solid   #04202B

Light:

    ground            #F7F9FA
    surface           #FFFFFF
    raised            #F0F3F5
    line              #DCE3E8
    ink               #0E1216
    dim               #54626F
    accent            #0077A6
    accent-solid      #0077A6
    on-accent-solid   #FFFFFF

One accent. No second colour, no gradient pairs. The brand mark is `#0092CA`; the text accents move
off it so they pass contrast on each ground.

Every pair meets Web Content Accessibility Guidelines level AA, measured rather than assumed:

    dark   ink on ground 16.05   dim on ground 6.85   accent on ground 8.20   button 4.78
    light  ink on ground 17.81   dim on ground 5.93   accent on ground 4.75   button 5.01

White on `#0092CA` is 3.52 and fails. That is why light mode darkens the button rather than keeping
the brand blue.

## Type

Three faces, self hosted, latin subset, 88 KB in total. Nothing loads from another host.

    Chivo             display, headings
    Hanken Grotesk    body
    JetBrains Mono    labels, data, breadcrumbs, anything tabular

Labels in the mono face are uppercase with 0.12em tracking. Numbers that line up in a column get
`font-variant-numeric: tabular-nums`.

Scale, in rem against a 16px root:

    display   clamp(2.4rem, 5.2vw, 4.2rem)   Chivo 700, -0.035em, 1.02
    h2        clamp(1.75rem, 3vw, 2.4rem)    Chivo 700, -0.025em, 1.08
    h3        1.25rem                        Chivo 600, -0.01em
    body-lg   1.125rem                       Hanken 400, 1.6
    body      1rem                           Hanken 400, 1.65
    label     0.75rem                        Mono 500, 0.12em, uppercase

Running text stays near 65 characters. Headings get `text-wrap: balance`.

## Space

An 8 point grid. Steps: 4, 8, 16, 24, 40, 64, 96. Nothing between them.

Layout uses flex or grid with `gap`, never per element margins that collapse or double.

## Shape and depth

Square corners. Zero radius everywhere except a status dot, which is a circle because it is a lamp.
Rounded corners read consumer grade and this is not a consumer product.

No shadows and no blurs. Depth is a tonal step from `ground` to `surface` to `raised`, plus a one
pixel `line`. An interactive element does not lift, it illuminates: the border takes the accent.

## Motion

Sparing. 150ms on a hover or focus transition, nothing longer. Everything inside
`prefers-reduced-motion: no-preference`.

## Accessibility

Level AA contrast on every pair, checked with a ratio rather than by eye. A visible focus ring on
every interactive element. Tap targets at least 44 pixels. One `h1` per page. A skip link before the
content.

## Where this came from

Google Stitch produced the first version of the type stack and the token structure, and both were
better than what I had. Six things were corrected: two different accents across two screens, a token
file that contradicted its own prose, a button failing contrast, decorative charts plotting nothing,
a footer with the wrong year and no company details, and console cosplay in the copy.
