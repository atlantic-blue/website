"use client"

import { useEffect, useSyncExternalStore } from "react"

import { readConsent, whenTheAnswerChanges } from "@/lib/consent"

declare global {
    interface Window {
        dataLayer?: unknown[]
        gtag?: (...args: unknown[]) => void
    }
}

const tagElementId = "google-tag"
const tagAddress = "https://www.googletagmanager.com/gtag/js"

export interface AnalyticsProps {
    readonly measurementId?: string
}

const registrableDomain = (hostname: string): string | null => {
    const labels = hostname.split(".")
    const last = labels.at(-1) ?? ""
    if (labels.length < 2 || /^\d+$/.test(last)) {
        return null
    }
    return labels.slice(-2).join(".")
}

/**
 * Google sets `_ga` on the registrable domain, so a delete only lands when it
 * repeats that domain. The host only form goes first, because a cookie of the
 * same name can exist on both.
 */
export const expiredGoogleCookies = (cookies: string, hostname: string): string[] => {
    const domain = registrableDomain(hostname)

    return cookies
        .split(";")
        .map((part) => part.trim().split("=")[0] ?? "")
        .filter((name) => name === "_ga" || name.startsWith("_ga_"))
        .flatMap((name) => {
            const expired = `${name}=; Max-Age=0; Path=/`
            return domain === null ? [expired] : [expired, `${expired}; Domain=.${domain}`]
        })
}

const loadTheTag = (measurementId: string): void => {
    if (document.getElementById(tagElementId) !== null) {
        return
    }

    const tag = document.createElement("script")
    tag.id = tagElementId
    tag.async = true
    tag.src = `${tagAddress}?id=${measurementId}`
    document.head.append(tag)

    const queue = (window.dataLayer ??= [])
    // Google's tag reads an arguments object out of the queue, and an array is a
    // different shape, so this stays the function Google documents.
    const send =
        window.gtag ??
        function (): void {
            // eslint-disable-next-line prefer-rest-params
            queue.push(arguments)
        }

    window.gtag = send
    send("js", new Date())
    send("config", measurementId)
}

const removeTheTag = (): void => {
    document.getElementById(tagElementId)?.remove()

    for (const expired of expiredGoogleCookies(document.cookie, window.location.hostname)) {
        document.cookie = expired
    }
}

/**
 * The answer is read in the browser, as the banner reads it. A server read makes
 * every page dynamic, and CloudFront then holds one visitor's answer for
 * everybody who asks after them.
 *
 * The id is written into the bundle while the site builds, so a build without
 * the variable counts nobody.
 */
export const Analytics = ({
    measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "",
}: AnalyticsProps) => {
    const answer = useSyncExternalStore(whenTheAnswerChanges, readConsent, () => null)

    useEffect(() => {
        if (measurementId === "") {
            return
        }
        if (answer === "granted") {
            loadTheTag(measurementId)
            return
        }
        if (answer === "denied") {
            removeTheTag()
        }
    }, [answer, measurementId])

    // Every page carries this mark, so one read says the tag can load from
    // whichever page the visitor accepts on.
    return <div id="analytics" hidden />
}
